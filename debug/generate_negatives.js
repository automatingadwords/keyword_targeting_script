import {isNegativeKeyword} from '../script/is_negative_keyword.js';
import {getTargetingToolOutputData} from '../script/is_negative_keyword.js';

const targetingToolOutputData = getTargetingToolOutputData();

console.log(`targetingToolOutputData: ${targetingToolOutputData}`);

const searchTerm = 'water lake spout';
console.log(isNegativeKeyword(searchTerm, targetingToolOutputData));
// should be false


