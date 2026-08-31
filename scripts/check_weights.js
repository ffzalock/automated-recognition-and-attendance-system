const fs = require('fs');
const path = require('path');

const modelsDir = 'd:/ใใใ/automated-recognition-and-attendance-system/frontend-vue/public/models';

function checkModel(manifestName) {
  console.log(`Checking model: ${manifestName}`);
  const manifestPath = path.join(modelsDir, manifestName);
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found: ${manifestPath}`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let totalBytes = 0;
  
  // Weights manifest is an array of groups, each containing weights and paths
  for (const group of manifest) {
    let groupBytes = 0;
    let offset = 0;
    for (const weight of group.weights) {
      const shape = weight.shape;
      const numElements = shape.reduce((a, b) => a * b, 1);
      
      let elementSize = 4; // default float32
      if (weight.quantization) {
        if (weight.quantization.dtype === 'uint8') {
          elementSize = 1;
        } else if (weight.quantization.dtype === 'uint16') {
          elementSize = 2;
        }
      } else if (weight.dtype === 'float32') {
        elementSize = 4;
      }
      
      const weightBytes = numElements * elementSize;
      
      // Let's print details for the shape mentioned in the error
      if (shape.join(',') === '1,1,32,64') {
        console.log(`Found shape [1,1,32,64] in weight "${weight.name}": offset=${offset}, elements=${numElements}, bytes=${weightBytes}, dtype=${weight.dtype}, quantized=${!!weight.quantization}`);
      }
      
      offset += weightBytes;
      groupBytes += weightBytes;
    }
    console.log(`Group paths: ${JSON.stringify(group.paths)}, Expected Bytes: ${groupBytes}`);
    totalBytes += groupBytes;
    
    // Check actual size of files
    for (const fileRelPath of group.paths) {
      const filePath = path.join(modelsDir, fileRelPath);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`  File: ${fileRelPath}, Actual Size: ${stats.size} bytes`);
      } else {
        console.error(`  File not found: ${filePath}`);
      }
    }
  }
  console.log(`Total Expected Bytes: ${totalBytes}\n`);
}

checkModel('ssd_mobilenetv1_model-weights_manifest.json');
checkModel('face_landmark_68_model-weights_manifest.json');
checkModel('face_recognition_model-weights_manifest.json');
checkModel('face_landmark_68_tiny_model-weights_manifest.json');
