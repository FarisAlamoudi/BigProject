const mongoose = require('mongoose')

const ReservationSchema = new mongoose.Schema(
{
    UserID: {type: String, required: true},
    ResourceID: {type: String, required: true},
    Comment: {type: String, required: true},
    Start: {type: Date, required: true},
    End: {type: Date, required: true}
}, {collection: 'Reservations'})

ReservationSchema.path('Start').validate(async function(value)
{
    try
    {
        const reservationCount = await mongoose.models.Reservation.countDocuments(
        {
            ResourceID: this.ResourceID, Start: {$lt: this.End}, End: {$gt: this.Start}
        })
        return reservationCount === 0
    }
    catch (error) 
    {
        throw error
    }
}, 'Reservation overlaps with an existing reservation for the same ResourceID.')

module.exports = mongoose.model('Reservation', ReservationSchema)