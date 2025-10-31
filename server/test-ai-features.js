import dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import { analyzeResume, analyzeDiversity, searchTalent, analyzeCultureFit } from './src/services/aiService.js';

async function testAIFeatures() {
  console.log('=== Testing AI Features Across Platform ===\n');

  try {
    // Test 1: Analyze Resume
    console.log('1. Testing Resume Analysis...');
    const resumeResult = await analyzeResume(
      'John Doe, Software Developer with 5 years experience in JavaScript, React, Node.js. BSc Computer Science.',
      'Looking for a full-stack developer with JavaScript skills.'
    );
    console.log('Resume Analysis Result:', JSON.stringify(resumeResult, null, 2));
    console.log('');

    // Test 2: Analyze Diversity
    console.log('2. Testing Diversity Analysis...');
    const diversityResult = await analyzeDiversity([
      { name: 'John Doe', gender: 'Male', education: 'BSc' },
      { name: 'Jane Smith', gender: 'Female', education: 'MSc' },
      { name: 'Bob Johnson', gender: 'Male', education: 'PhD' }
    ]);
    console.log('Diversity Analysis Result:', JSON.stringify(diversityResult, null, 2));
    console.log('');

    // Test 3: Search Talent
    console.log('3. Testing Talent Search...');
    const talentResult = await searchTalent('JavaScript developer', [
      { name: 'John Doe', skills: ['JavaScript', 'React'] },
      { name: 'Jane Smith', skills: ['Python', 'Django'] },
      { name: 'Bob Johnson', skills: ['JavaScript', 'Node.js'] }
    ]);
    console.log('Talent Search Result:', JSON.stringify(talentResult, null, 2));
    console.log('');

    // Test 4: Analyze Culture Fit
    console.log('4. Testing Culture Fit Analysis...');
    const cultureResult = await analyzeCultureFit(
      { name: 'John Doe', skills: ['JavaScript'], experience: '5 years' },
      'We value teamwork and collaboration.'
    );
    console.log('Culture Fit Analysis Result:', JSON.stringify(cultureResult, null, 2));
    console.log('');

    console.log('All AI features tested successfully!');
  } catch (error) {
    console.error('Error during AI testing:', error.message);
  }
}

testAIFeatures();
