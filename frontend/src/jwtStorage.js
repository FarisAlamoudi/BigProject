function storeJWT (JWT) {
    try {
        localStorage.setItem('jwt_data', JWT);
    }
    catch (e) {
        console.log(e.message);
    }
}

function retrieveJWT () {
    var JWT;
    try {
        JWT = localStorage.getItem('jwt_data');
    }
    catch (e) {
        console.log(e.message);
        return (e.message);
    }
    return JWT;
}

module.exports = { storeJWT, retrieveJWT };
