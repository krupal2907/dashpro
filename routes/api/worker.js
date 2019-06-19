const routes = require("express").Router();
const Worker = require("../../models/Worker");
const {
    check,
    validationResult
} = require("express-validator/check");

// @GET /
// @desc Gets all the woker from database if query params are not there
// @desc If query params exists then shows the person with id /?id=${id}
// @acc PRIVATE
routes.get("/", async (req, res) => {
    //Get all the workers from DataBase
    id = req.query.id;
    if (id) {
        try {
            const id = req.query.id;
            let worker = await Worker.findById(id).select("-Attendence.meta -meta");
            if (worker) {
                res.json(worker);
            } else {
                throw new TypeError('Obj')
            }
        } catch (error) {
            // @known-Error unknown Id
            // @unknown-Error Server Error
            if (error.kind === "ObjectId" || error.name === 'TypeError') {
                return res.status(400).json({
                    msg: "Invalid! Id"
                });
            }
            console.error(error.message);
            res.status(500).json({
                msg: "Server Error"
            });
        }
    } else {
        try {
            const workers = await Worker.find()
                .sort({
                    "meta.createdAt": -1
                })
                .select("name number email address dailywage Borrowed Attendence");
            const newWorkersArray = workers.map(worker => {
                return {
                    _id: worker._id,
                    name: worker.name.full,
                    email: worker.email,
                    borrowed: worker.getTotal,
                    number: worker.number,
                    address: worker.address,
                    salary: worker.getSalary,
                    eA: worker.isAttendenceSubmitted
                };
            });
            res.json(newWorkersArray);
        } catch (error) {
            // @known-Error nothing
            // @unknown-Error Server Error
            console.error(error.message);
            res.status(500).json({
                msg: "Server Error"
            });
        }
    }
});

// @POST /new-worker
// @desc POST a new worker to database
// @acc PRIVATE
routes.post(
    "/new-worker",
    [
        check("first", "Enter the first name")
        .not()
        .isEmpty(),
        check("last", "Enter the last name")
        .not()
        .isEmpty(),
        check("number", "Enter Number")
        .isNumeric()
        .not()
        .isEmpty(),
        check("dailywage", "Enter daily wage")
        .isNumeric()
        .not()
        .isEmpty(),
        check("email", "Enter valid email").isEmail(),
        check("number", "Enter valid number").isNumeric()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            first,
            last,
            number,
            email,
            address,
            dailywage,
            available,
            temp
        } = req.body;

        const workerFeilds = {};
        workerFeilds.name = {};
        workerFeilds.name.first = first;
        workerFeilds.name.last = last;
        workerFeilds.number = number;
        workerFeilds.email = email;
        workerFeilds.address = address;
        workerFeilds.dailywage = dailywage;
        workerFeilds.available = available;
        workerFeilds.temp = temp;

        const newWorker = new Worker(workerFeilds);

        try {
            const savedWorker = await newWorker.save();

            res.json({
                savedWorker
            });
        } catch (error) {
            // @known-Error email not unique
            // @unknown-Error Server Error
            if (error.code === 11000) {
                return res.status(400).json({
                    msg: "Email! already Taken"
                });
            }
            console.error(error.message);
            res.status(500).json({
                msg: "Server Error"
            });
        }
    }
);

// @PUT /?id=${id}&pts=${pts}
// @desc PUT A WORKER ATTENDENCE
// @acc PRIVATE


// @PUT /?dmp=${id}
// @desc deletes BORROWED ATTENDENCE  == MODIFY ==  _V bothDeletedAt MODIFIEDAT
// @desc FOR dumping the sessioss
routes.put("/", async (req, res) => {
    const id = req.query.id;
    const pts = req.query.pts;
    const dmp = req.query.dmp;
    if (id && pts) {
        if (pts == 0 || pts == 1 || pts == 1.5 || pts == 2) {
            try {
                // @desc Query for Attendence

                const worker = await Worker.findById(id);
                if (!worker.isAttendenceSubmitted) {
                    throw new Error('Already Submitted Attendence');
                } else {
                    if (worker === null || worker === undefined) {
                        throw new TypeError('Please Check Id');
                    } else {
                        worker.Attendence.attendencedetails.unshift({
                            points: pts
                        });
                        await worker.save();
                        res.json({
                            msg: "Success"
                        });
                    }
                }
            } catch (error) {
                if (error.kind === "ObjectId" || error.name === "TypeError") {
                    return res.status(400).json({
                        msg: "Invalid! Id"
                    });
                }
                if (error.message === "Already Submitted Attendence") {
                    return res.status(400).json({
                        msg: "Already Submitted"
                    });
                }
                console.error(error.message);
                res.status(500).json({
                    msg: "Server Error"
                });
            }
        } else {
            return res.status(400).json({
                msg: "Cannot process information"
            })
        }
    } else if (dmp) {
        try {
            let worker = await Worker.findById(dmp).select("Borrowed Attendence");

            if (worker === null || worker === undefined) {
                throw new TypeError('Please Check Id');
            }
            worker.Borrowed.borrowedDetails = [];
            worker.Attendence.attendencedetails = [];
            worker.Attendence.meta.modifiedAt = undefined;
            await worker.save();

            res.json({
                msg: "Success"
            })
        } catch (error) {
            if (error.kind === "ObjectId" || error.name === "TypeError") {
                return res.status(400).json({
                    msg: "Invalid! Id"
                });
            }
            console.error(error.message);
            res.status(500).json({
                msg: "Server Error"
            });
        }
    } else {
        res.json({
            msg: "Invalid! Query"
        })
    }
});

// @DELETE /:id
// @desc DELETE THE WORKER
// @acc PRIVATE
routes.delete('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const worker = await Worker.deleteOne({
            _id: id
        });
        if (!worker.deletedCount) {
            throw new TypeError('ObjectId')
        }
        res.json({
            msg: "Removed! Success"
        });
    } catch (error) {
        if (error.kind === "ObjectId" || error.name === "TypeError") {
            return res.status(400).json({
                msg: "Invalid! Id"
            });
        }
        console.error(error.message);
        res.status(500).json({
            msg: "Server Error"
        });
    }
});


// @PUT /borrowed/:id
// @desc Add the Borrowed
// @acc PRIVATE
routes.put('/borrowed/:id', [
    check('amt', 'Amount is required').isNumeric()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const id = req.params.id;
    const msg = req.body.msg;
    const amt = req.body.amt;
    try {
        // @desc Query for Borrowed

        const worker = await Worker.findById(id);

        if (worker === null || worker === undefined) {
            throw new TypeError('Please Check Id');
        } else {
            worker.Borrowed.borrowedDetails.unshift({
                msg: msg,
                amount: amt
            });
            await worker.save();
            res.json(worker);
        }

    } catch (error) {
        if (error.kind === "ObjectId" || error.name === "TypeError") {
            return res.status(400).json({
                msg: "Invalid! Id"
            });
        }
        console.error(error.message);
        res.status(500).json({
            msg: "Server Error"
        });
    }
});


module.exports = routes;