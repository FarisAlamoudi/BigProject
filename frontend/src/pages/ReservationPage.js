import React from 'react';

import PageTitle from '../components/PageTitle';
import LoggedInName from '../components/LoggedInName';

const ReservationPage = () =>
{
    return(
        <div>
            <PageTitle/>
            <LoggedInName/>
        </div>
    );
}

export default ReservationPage;