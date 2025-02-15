const db = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Advanced project member suggestion with AI
exports.suggestProjectMembers = async (req, res) => {
  console.log('Suggest Members Request:', {
    body: req.body,
    user: req.user,
    headers: req.headers
  });

  const { projectDescription } = req.body;

  if (!projectDescription) {
    console.error('Suggest Members Error: No project description provided');
    return res.status(400).json({ 
      message: 'Project description is required for member suggestion',
      details: 'The request body must include a non-empty projectDescription field'
    });
  }

  let connection;
  try {
    // Verify database connection
    connection = await db.getConnection();
    console.log('Database connection established successfully');

    // Diagnostic query to check table existence and structure
    const [tableCheck] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'users') as users_exists,
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'user_competencies') as competencies_exists,
        (SELECT COUNT(*) FROM information_schema.tables 
         WHERE table_schema = DATABASE() AND table_name = 'projets') as projets_exists
    `);

    console.log('Table Existence Check:', tableCheck[0]);

    // Comprehensive member query with detailed competency information
    const [members] = await connection.query(`
      SELECT 
        u.cin AS id, 
        u.nom AS name, 
        u.email,
        u.num_tele AS phone,
        u.poste AS position,
        u.experience AS work_experience,
        u.disponibilitee AS availability,
        (
          SELECT GROUP_CONCAT(DISTINCT uc.competence_name)
          FROM user_competencies uc
          WHERE uc.user_cin = u.cin
        ) as competencies,
        (
          SELECT GROUP_CONCAT(DISTINCT uc.proficiency_level)
          FROM user_competencies uc
          WHERE uc.user_cin = u.cin
        ) as proficiencyLevels,
        (
          SELECT GROUP_CONCAT(DISTINCT p.nom_projet)
          FROM projetmanagers pm
          JOIN projets p ON pm.projet_id = p.id
          WHERE pm.manager_cin = u.cin
        ) as previousProjects,
        (
          SELECT COUNT(DISTINCT pm.projet_id)
          FROM projetmanagers pm
          WHERE pm.manager_cin = u.cin
        ) as projectCount
      FROM 
        users u
      WHERE 
        u.role = '2' AND u.disponibilitee = 1  -- Active Membre role
      LIMIT 10
    `);

    console.log('Members Query Result:', {
      memberCount: members.length,
      firstMember: members[0]
    });

    // Prepare members data with more detailed information
    const formattedMembers = members.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      contact: {
        phone: member.phone,
        position: member.position,
        workExperience: member.work_experience
      },
      availability: member.availability === 1,
      competencies: member.competencies ? member.competencies.split(',').filter(Boolean) : [],
      proficiencyLevels: member.proficiencyLevels ? member.proficiencyLevels.split(',').filter(Boolean) : [],
      previousProjects: member.previousProjects ? member.previousProjects.split(',').filter(Boolean) : [],
      projectCount: member.projectCount || 0
    }));

    console.log('Formatted Members:', formattedMembers);

    // Fallback if no members found
    if (formattedMembers.length === 0) {
      return res.status(404).json({
        message: 'No available members found',
        details: 'No users with role 2 and availability were found'
      });
    }

    // Verify Gemini AI configuration
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Use Gemini AI for advanced member ranking
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const aiPrompt = `
      You are an expert project team assembler. Your task is to rank potential team members 
      based on their competencies and how well they match a specific project description.

      Project Description: ${projectDescription}

      Ranking Criteria:
      1. Direct skill match with project requirements
      2. Depth and diversity of competencies
      3. Proficiency levels in relevant skills
      4. Previous project experience
      5. Availability and potential for learning

      Candidate Members:
      ${formattedMembers.map(member => `
        - Name: ${member.name}
        - Position: ${member.contact.position}
        - Skills: [${member.competencies.join(', ') || 'No skills'}]
        - Proficiency Levels: [${member.proficiencyLevels.join(', ') || 'Not specified'}]
        - Previous Projects: [${member.previousProjects.join(', ') || 'None'}]
        - Project Experience: ${member.projectCount} projects
        - Available: ${member.availability ? 'Yes' : 'No'}
      `).join('\n')}

      Provide a ranked list of top 3 members with a detailed match score and recommendation.
      Format: 
      Rank | Name | Match Score (0-100) | Key Matching Skills | Recommendation Notes
    `;

    console.log('AI Prompt Length:', aiPrompt.length);

    try {
      const result = await model.generateContent(aiPrompt);
      const aiRecommendation = result.response.text();

      console.log('AI Recommendation:', aiRecommendation);

      // Parse AI recommendation with robust error handling
      const rankedMembers = aiRecommendation
        .split('\n')
        .filter(line => line.includes('|'))
        .slice(1)  // Skip header
        .map(line => {
          try {
            const [rank, name, matchScore, matchingSkills, notes] = line.split('|').map(cell => cell.trim());
            const member = formattedMembers.find(m => m.name.includes(name));
            
            return {
              ...member,
              rank: parseInt(rank) || 0,
              matchScore: parseFloat(matchScore) || 0,
              matchingSkills: matchingSkills ? matchingSkills.split(',') : [],
              recommendationNotes: notes || 'No specific recommendation'
            };
          } catch (parseError) {
            console.error('Error parsing AI recommendation line:', line, parseError);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);  // Limit to top 3

      console.log('Ranked Members:', rankedMembers);

      res.status(200).json({
        members: rankedMembers,
        aiInsights: aiRecommendation
      });

    } catch (aiError) {
      console.error('Gemini AI Error:', aiError);
      res.status(500).json({
        message: 'Failed to generate AI recommendations',
        error: aiError.message
      });
    }

  } catch (error) {
    console.error('Suggest Members FULL Error:', {
      message: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      name: error.name,
      code: error.code
    });

    res.status(500).json({
      message: 'Failed to suggest members',
      error: process.env.NODE_ENV !== 'production' 
        ? {
            message: error.message,
            stack: error.stack,
            sqlMessage: error.sqlMessage,
            name: error.name,
            code: error.code
          } 
        : 'Internal Server Error'
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.assignProjectMember = async (req, res) => {
  const { memberId } = req.body;
  let connection;

  try {
    connection = await db.getConnection();

    // Validate member exists
    const [memberCheck] = await connection.query(
      'SELECT * FROM users WHERE id = ? AND role = "2"', 
      [memberId]
    );

    if (memberCheck.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.status(200).json({ 
      message: 'Member assigned successfully',
      member: memberCheck[0]
    });
  } catch (error) {
    console.error('Assign Member Error:', error);
    res.status(500).json({
      message: 'Failed to assign member',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal Server Error'
    });
  } finally {
    if (connection) connection.release();
  }
};

// Optional: Only add if you need to fetch projects
exports.getProjectManagerProjects = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    // Fetch projects for the current project manager
    const [projects] = await connection.query(`
      SELECT p.* 
      FROM projects p
      WHERE p.project_manager_id = ?
    `, [req.user.id]);

    res.status(200).json(projects);
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal Server Error'
    });
  } finally {
    if (connection) connection.release();
  }
};