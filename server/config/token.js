const tokenTypes ={
    REFRESH: "refreshToken",
    VERIFY_EMAIL:"verifyEmail",
    ACCESS:"access",
    RESET_PASSWORD:"resetPassword"
}

const tokenList = Object.values(tokenTypes)

export {tokenTypes, tokenList}