 const convertScore = (score10) => {
  let score4, scoreLetter;
  if (score10 >= 9.0) { score4 = 4.0; scoreLetter = 'A+'; }
  else if (score10 >= 8.5) { score4 = 3.7; scoreLetter = 'A'; }
  else if (score10 >= 8.0) { score4 = 3.5; scoreLetter = 'B+'; }
  else if (score10 >= 7.0) { score4 = 3.0; scoreLetter = 'B'; }
  else if (score10 >= 6.0) { score4 = 2.5; scoreLetter = 'C+'; }
  else if (score10 >= 5.0) { score4 = 2.0; scoreLetter = 'C'; }
  else if (score10 >= 4.0) { score4 = 1.0; scoreLetter = 'D'; }
  else { score4 = 0.0; scoreLetter = 'F'; }
  return { score4: score4.toFixed(1), scoreLetter };
};

export default convertScore