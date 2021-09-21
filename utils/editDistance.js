module.exports = function(string, transformedString) {
	string = string.split("");
	transformedString = transformedString.split("");
	
	const rows = transformedString.length + 1;
	const columns = string.length + 1;

	
	const matrix = new Array(rows);

	for(let i = 0; i < rows; i++) {
		matrix[i] = new Array(columns);
	}

	for(let i = 0; i < rows; i++) {
		for(let j = 0; j < columns; j++) {
			if(i == 0 ) {
				matrix[i][j] = j;
			}
			else if(j == 0) {
				matrix[i][j] = i;
			}
			else if(string[j-1] == transformedString[i-1]) {
				matrix[i][j] = matrix[i-1][j-1];
			}
			else {
				const min = Math.min(matrix[i-1][j], matrix[i][j-1], matrix[i-1][j-1]);
				matrix[i][j] = min + 1;
			}
			
		}
	}

	return matrix[rows-1][columns-1];
}