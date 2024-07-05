import React from 'react';

import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';
import Dashboard from '../components/Dashboard';

const HomePage = () =>
{
    return(
        <div>
            <PageTitle/>
            <LoggedInName/>
            <Dashboard/>
        </div>
    );
};

export default HomePage;