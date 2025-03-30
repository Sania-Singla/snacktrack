function getRollNo(userName) {
    return userName.slice(userName.indexOf('-') + 1);
}

export { getRollNo };
