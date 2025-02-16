const db = require('../config/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Advanced project member suggestion with intelligent AI matching
exports.suggestProjectMembers = async (req, res) => {
  const { projectDescription } = req.body;

  // Enhanced input validation
  if (!projectDescription || projectDescription.trim().length < 10) {
    return res.status(400).json({ 
      message: 'Invalid project description',
      details: 'Project description must be meaningful and at least 10 characters long'
    });
  }

  let connection;
  try {
    connection = await db.getConnection();

    // Advanced query with comprehensive member information
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
          SELECT GROUP_CONCAT(
            CONCAT(
              '{',
              '"name":"', REPLACE(COALESCE(uc.competence_name, ''), '"', '\\"'), 
              '","level":"', REPLACE(COALESCE(uc.proficiency_level, ''), '"', '\\"'), 
              '","added":"', COALESCE(DATE_FORMAT(uc.created_at, '%Y-%m-%d'), ''), 
              '"}'
            ) SEPARATOR ','
          )
          FROM user_competencies uc
          WHERE uc.user_cin = u.cin
        ) AS competencies,
        (
          SELECT GROUP_CONCAT(DISTINCT p.nom_projet)
          FROM projetmanagers pm
          JOIN projets p ON pm.projet_id = p.id
          WHERE pm.manager_cin = u.cin
        ) AS previousProjects,
        (
          SELECT COUNT(DISTINCT pm.projet_id)
          FROM projetmanagers pm
          WHERE pm.manager_cin = u.cin
        ) AS projectCount
      FROM 
        users u
      WHERE 
        u.role = '2' AND u.disponibilitee = 1
      ORDER BY 
        projectCount DESC
      LIMIT 20
    `);

    // Function to calculate match score based on project description
    const calculateMatchScore = (competencies, projectDescription) => {
      // Normalize project description and extract key skills
      const normalizedDescription = projectDescription.toLowerCase();
      const skillKeywords = [
        // Databases
        'mysql', 'postgresql', 'mongodb', 'firebase', 'dynamodb', 'redis', 'neo4j', 'cassandra',
      
        // Frontend
        'react', 'reactjs', 'nextjs', 'vue', 'vuejs', 'angular', 'svelte', 'solidjs', 
        'tailwindcss', 'bootstrap', 'materialui', 'chakraui', 'shadcn', 'framer-motion',
      
        // Backend
        'node', 'nodejs', 'express', 'expressjs', 'nestjs', 'fastify', 'koa', 'hapi', 
        'springboot', 'django', 'flask', 'ruby on rails', 'aspnet', 'graphql', 'trpc',
      
        // Full-Stack & General Web
        'fullstack', 'backend', 'frontend', 'web development', 'api', 'restapi', 'graphql', 'microservices',
      
        // DevOps & Cloud
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'heroku', 'netlify', 'vercel', 'firebase hosting', 
        'terraform', 'cloudflare', 'nginx', 'cicd', 'github actions',
      
        // Authentication & Security
        'jwt', 'oauth', 'passportjs', 'bcrypt', 'argon2', 'csrf', 'cors', 'rbac', 'sso',
      
        // Testing & Quality Assurance
        'jest', 'mocha', 'chai', 'cypress', 'playwright', 'puppeteer', 'postman', 'supertest',
      
        // Mobile Development
        'reactnative', 'flutter', 'swift', 'kotlin', 'capacitor', 'expo',
      
        // Programming Languages
        'javascript', 'typescript', 'python', 'java', 'csharp', 'golang', 'rust', 'ruby', 'php', 'dart', 'c++',
      
        // Miscellaneous
        'ai', 'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'data science', 'websockets',
        'progressive web apps', 'pwa', 'headless cms', 'contentful', 'sanity'
      ];
      

      // Proficiency weight multipliers
      const proficiencyScore = {
        'Expert': 4,
        'Advanced': 3,
        'Intermediate': 2,
        'Beginner': 1,
        'default': 0
      };

      // Calculate skill match and expertise
      let totalScore = 0;
      let matchedSkills = 0;

      competencies.forEach(comp => {
        const normalizedSkill = comp.name.toLowerCase();
        const skillLevel = comp.level;

        // Check if skill matches project description
        const isSkillRelevant = skillKeywords.some(keyword => 
          normalizedDescription.includes(keyword) && 
          normalizedSkill.includes(keyword)
        );

        if (isSkillRelevant) {
          matchedSkills++;
          totalScore += (proficiencyScore[skillLevel] || proficiencyScore['default']) * 25;
        }
      });

      // Calculate final match score
      const baseMatchScore = Math.min(
        Math.round((totalScore / (competencies.length * 4)) * 100), 
        100
      );

      // Bonus for multiple matched skills
      const skillMatchBonus = Math.min(matchedSkills * 10, 20);

      return Math.min(baseMatchScore + skillMatchBonus, 100);
    };

    // Advanced competency parsing with robust error handling
    const formattedMembers = members.map(member => {
      let parsedCompetencies = [];
      
      try {
        // Enhanced parsing with multiple fallback mechanisms
        if (member.competencies) {
          // Wrap entire string in array brackets to make it a valid JSON array
          const jsonString = `[${member.competencies}]`;
          parsedCompetencies = JSON.parse(jsonString).map(comp => ({
            name: comp.name || '',
            level: comp.level || '',
            added: comp.added || ''
          })).filter(comp => comp.name || comp.level);
        }
      } catch (error) {
        console.error(`Detailed competency parsing error for member ${member.name}:`, {
          errorMessage: error.message,
          rawCompetencies: member.competencies
        });
      }

      // Calculate match score using project description
      const matchScore = calculateMatchScore(parsedCompetencies, projectDescription);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        contact: {
          phone: member.phone,
          position: member.position,
          workExperience: member.work_experience
        },
        availability: member.availability === 1,
        competencies: parsedCompetencies,
        previousProjects: member.previousProjects ? 
          member.previousProjects.split(',').filter(Boolean) : [],
        projectCount: member.projectCount || 0,
        matchScore
      };
    }).filter(member => member.competencies.length > 0)
    .sort((a, b) => b.matchScore - a.matchScore);  // Sort by match score

    // Diagnostic logging
    console.log('Formatted Members Diagnostic:', {
      totalMembers: formattedMembers.length,
      topMembers: formattedMembers.slice(0, 3).map(m => ({
        name: m.name,
        matchScore: m.matchScore,
        competencies: m.competencies
      }))
    });

    // AI-Enhanced Member Ranking
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const aiPrompt = `
      Advanced Project Team Member Recommendation System

      Project Context: ${projectDescription}

      Ranking Criteria:
      1. Direct skill alignment
      2. Proficiency depth
      3. Project experience relevance
      4. Learning potential
      5. Team compatibility

      Candidate Profiles:
      ${formattedMembers.map(member => `
        Profile:
        - Name: ${member.name}
        - Position: ${member.contact.position}
        - Skills: ${member.competencies.map(c => 
          `${c.name} (${c.level})`).join(', ')}
        - Previous Projects: ${member.previousProjects.join(', ') || 'None'}
        - Project Experience: ${member.projectCount}
        - Expertise Score: ${member.expertiseScore}
      `).join('\n\n')}

      Provide a ranked recommendation with match percentage and key insights.
      Format: Rank | Name | Match % | Key Skills | Recommendation Notes
    `;

    try {
      const result = await model.generateContent(aiPrompt);
      const aiRecommendation = result.response.text();

      const rankedMembers = aiRecommendation
        .split('\n')
        .filter(line => line.includes('|'))
        .slice(1)  // Skip header
        .map(line => {
          const [rank, name, matchScore, keySkills, notes] = 
            line.split('|').map(cell => cell.trim());
          
          const member = formattedMembers.find(m => 
            m.name.toLowerCase().includes(name.toLowerCase())
          );

          return member ? {
            ...member,
            rank: parseInt(rank) || 0,
            matchScore: parseFloat(matchScore) || 0,
            keySkills: keySkills ? keySkills.split(',') : [],
            recommendationNotes: notes
          } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 3);  // Top 3 recommendations

      res.status(200).json({
        members: rankedMembers,
        aiInsights: aiRecommendation
      });

    } catch (aiError) {
      console.error('AI Recommendation Generation Error:', aiError);
      res.status(500).json({
        message: 'AI recommendation generation failed',
        error: aiError.message
      });
    }

  } catch (error) {
    console.error('Member Suggestion Error:', error);
    res.status(500).json({
      message: 'Failed to suggest project members',
      error: error.message
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