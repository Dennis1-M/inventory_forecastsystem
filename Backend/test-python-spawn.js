/**
 * Diagnose Python Spawning Issues
 * Tests if Python can be spawned correctly from Node.js with all dependencies
 */

import { spawn } from 'child_process';
import colors from 'colors';

function testPythonSpawn() {
  console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(colors.cyan('║         Testing Python Subprocess Spawning              ║'));
  console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  // Test 1: Basic Python version
  console.log(colors.yellow('Test 1: Python version check...'));
  const python1 = spawn('python', ['--version']);
  
  python1.stdout.on('data', (data) => console.log(colors.green(`✅ ${data}`)));
  python1.stderr.on('data', (data) => console.log(colors.green(`✅ ${data}`)));
  python1.on('error', (err) => console.log(colors.red(`❌ Error: ${err.message}`)));
  python1.on('close', (code) => {
    console.log(code === 0 ? colors.green('✅ Test 1 passed\n') : colors.red(`❌ Test 1 failed (code ${code})\n`));
    
    // Test 2: Import numpy
    console.log(colors.yellow('Test 2: Numpy import...'));
    const python2 = spawn('python', ['-c', 'import numpy; print(f"Numpy version: {numpy.__version__}")']);
    
    python2.stdout.on('data', (data) => console.log(colors.green(`✅ ${data}`)));
    python2.stderr.on('data', (data) => console.log(colors.red(`stderr: ${data}`)));
    python2.on('close', (code) => {
      console.log(code === 0 ? colors.green('✅ Test 2 passed\n') : colors.red(`❌ Test 2 failed (code ${code})\n`));
      
      // Test 3: Import xgboost
      console.log(colors.yellow('Test 3: XGBoost import...'));
      const python3 = spawn('python', ['-c', 'import xgboost; print(f"XGBoost version: {xgboost.__version__}")']);
      
      python3.stdout.on('data', (data) => console.log(colors.green(`✅ ${data}`)));
      python3.stderr.on('data', (data) => console.log(colors.red(`stderr: ${data}`)));
      python3.on('close', (code) => {
        console.log(code === 0 ? colors.green('✅ Test 3 passed\n') : colors.red(`❌ Test 3 failed (code ${code})\n`));
        
        // Test 4: Full model import test
        console.log(colors.yellow('Test 4: Full model import...'));
        const modelsPath = 'D:\\\\FINALPROJECT2\\\\Backend\\\\forecast2\\\\models';
        const pythonCode = `
import sys
sys.path.insert(0, r"${modelsPath}")
from xgboost_model import forecast_xgboost
print("✅ XGBoost model imported successfully")
`;
        
        const python4 = spawn('python', ['-c', pythonCode]);
        
        python4.stdout.on('data', (data) => console.log(colors.green(data.toString())));
        python4.stderr.on('data', (data) => console.log(colors.red(`stderr: ${data}`)));
        python4.on('close', (code) => {
          console.log(code === 0 ? colors.green('\n✅ Test 4 passed') : colors.red(`\n❌ Test 4 failed (code ${code})`));
          
          console.log(colors.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
          console.log(colors.cyan('║                   Diagnosis Complete                     ║'));
          console.log(colors.cyan('╚═══════════════════════════════════════════════════════════╝\n'));
          
          if (code === 0) {
            console.log(colors.green('✅ All tests passed! Python spawning works correctly.'));
            console.log(colors.white('\nThe issue may be:'));
            console.log(colors.white('  1. Insufficient historical data (need 17+ days for XGBoost)'));
            console.log(colors.white('  2. Timing issues during startup'));
            console.log(colors.white('  3. Data format issues'));
          } else {
            console.log(colors.red('❌ Python spawning has issues.'));
            console.log(colors.white('\nPossible fixes:'));
            console.log(colors.white('  1. Ensure Python dependencies are installed: pip install numpy pandas xgboost scikit-learn'));
            console.log(colors.white('  2. Check if Python is in system PATH'));
            console.log(colors.white('  3. Try using python3 instead of python'));
            console.log(colors.white('  4. Activate virtual environment before starting backend'));
          }
        });
      });
    });
  });
}

testPythonSpawn();
