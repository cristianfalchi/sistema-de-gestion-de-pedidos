module.exports = {
    database: {
        host: process.env.SERVER_DB || '192.168.168.2',
        user: process.env.USER_DB || 'root',
        password: process.env.PASSWORD_DB || 'xima2008',
        database: process.env.NAME_DB || 'discv'
    },
    databaseSequelize: {
        database: process.env.NAME_DB || 'discv',
        user: process.env.USER_DB || 'root',
        password: process.env.PASSWORD_DB || 'xima2008',
        options: {
            host: process.env.SERVER_DB || '192.168.168.2',
            dialect: 'mysql'
        }
    }
};