// Unused

// export function emphaticScoreComplaint(complaint) {
//     const keywords = ['emergency', 'urgent', 'corruption', 'abuse'];
//     const description = complaint.description.toLowerCase();
//     let score = 0;
  
//     keywords.forEach((word) => {
//       if (description.includes(word)) score += 20;
//     });
  
//     if (complaint.description.length > 150) score += 10;
//     if (complaint.category.toLowerCase().includes('health') || complaint.category.toLowerCase().includes('safety')) {
//       score += 15;
//     }
  
//     if (complaint.name === 'Anonymous') {
//       score += 5; // optional weight for anonymity
//     }
  
//     return score;
//   }  
