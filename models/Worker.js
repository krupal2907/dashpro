const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workerSchema = new Schema({
    name: {
        first: {
            type: String,
            lowercase: true,
            required: true
        },
        last: {
            type: String,
            lowercase: true,
            required: true
        }
    },
    number: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    address: {
        type: String
    },
    dailywage: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean
    },
    temp: {
        type: Boolean
    },
    Borrowed: {
        borrowedDetails: [{
            dateofborrowing: {
                type: Date,
                default: Date.now
            },
            msg: {
                type: String
            },
            amount: {
                type: Number,
                required: true
            }
        }]
    },
    Attendence: {
        attendencedetails: [{
            date: {
                type: Date,
                default: Date.now
            },
            points: {
                type: Number,
                required: true
            }
        }],
        meta: {
            createdAt: {
                type: Date,
                default: Date.now
            },
            modifiedAt: {
                type: Date
            }
        }
    },
    meta: {
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
});

// @desc This is virtual property to check if attendence is submitted 
// @use instance.getSalary returns boolean
// @helper method
workerSchema
    .virtual('isAttendenceSubmitted')
    .get(function () {
        if (this.Attendence.meta.modifiedAt === undefined || this.Attendence.meta.modifiedAt === null) {
            // @exp Either new session or Either new Worker
            return true;
        } else {
            const lastmodified = new Date(this.Attendence.meta.modifiedAt);
            const todaysDate = new Date();
            // @exp This gets Todays date and subs lastMOdified date if === 0 then modified else not modified
            if ((todaysDate.getDate() - lastmodified.getDate()) === 0) {
                return false;
            } else {
                return true;
            }
        }
    });

// @desc This is virtual property to get total salary
// @use instance.getSalary
// @helper method
workerSchema
    .virtual('getSalary')
    .get(function () {
        let count = 0;
        this.Attendence.attendencedetails.forEach(object => {
            count = count + object.points;
        });
        return count * this.dailywage;
    });

// @desc This is virtual property inc in name to get the total borrowed amount
// @use instance.name.full
// @helper method
workerSchema
    .virtual('name.full')
    .get(function () {
        return this.name.first + ' ' + this.name.last;
    });


// @desc This is virtual property  get the total borrowed amount
// @use instance.getBorrowed
// @helper method
workerSchema
    .virtual('getTotal')
    .get(function () {
        let count = 0;
        this.Borrowed.borrowedDetails.forEach(object => {
            count = count + object.amount;
        });
        return count;
    });


// @new-Doc It creates the meta i main docs
// @old Modified 
//               --- Attendence --- changes modified at
// @helper method
workerSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta = {};
        this.meta.createdAt = this.meta.modifiedAt = Date.now();
    } else {
        if (this.isModified('Attendence.meta.modifiedAt')) {
            next();
        } else {
            if (this.isModified('Attendence.attendencedetails')) {
                this.Attendence.meta.modifiedAt = Date.now();
            }
        }
    }
    next();
});

module.exports = mongoose.model('worker', workerSchema);