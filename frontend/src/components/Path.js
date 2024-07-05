const app_name = '4331booking'

exports.buildPath = function buildPath(route)
{
    if (process.env.NODE_ENV === 'production')
    {
        return 'https://www.' + app_name + '.com/' + route;
    }
    else
    {
        return 'http://localhost:5000/' + route;
    }
}