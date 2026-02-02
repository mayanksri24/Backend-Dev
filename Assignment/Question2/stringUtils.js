function capitalizingFirstLetter(str){
    let result = str.charAt(0).toUpperCase() + str.slice(1);
    return result;
}
function capitalizingString(str){
    let result = str.toUpperCase();
    return result;
}
function reversingString(str){
    let result = str.split('').reverse().join('');
    return result;
}
function countVowels(str){
    let vowels ='aeiouAEIOU';
    let count=0;
    for(let char of str){
        if(vowels.includes(char)){
            count++;
        }
    }
    return count;
}
module.exports = {
    capitalizingFirstLetter,
    capitalizingString,
    reversingString,
    countVowels
};