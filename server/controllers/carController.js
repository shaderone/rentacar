const Car = require('../models/Car');
const asyncHandler = require('express-async-handler');

// @desc Create a new car (host only)
// @route POST /api/cars
// @access Private (host only)
const createCar = asyncHandler(async (req, res) => {
    // 1. Get data from the request body
    // TODO : 'owner', 'adminApproved' is excluded because its set manually later (default false)
    const {
        make, model, year, plateNumber, pricePerDay,
        fuelType, transmission, seats, mileage,
        images, description
    } = req.body;

    // 2. Validation: Ensure user is a Host (do this in middleware later) | Its a security measure
    if (req.user.role !== 'host') {
        res.status(403);
        throw new Error('Only hosts can create car listings');
    }

    // 3. Create the Car Object
    const car = await Car.create({
        owner: req.user._id, // from the token - cookie (middleware)
        make,
        model,
        year,
        plateNumber,
        pricePerDay,
        fuelType,
        transmission,
        seats,
        mileage,
        images,
        description,
    });

    if (car) {
        res.status(201).json({
            // message: 'Car created successfully, pending admin approval.',
            car
        });
    } else {
        res.status(400);
        throw new Error('Invalid car data');
    }
});

// @desc    Get single car by ID
// @route   GET /api/cars/:id
// @access  Public
const getCarById = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id).populate('owner', 'name email'); // populate the owner with their name and email instead of just the owner id.

    if (car) {
        res.json(car);
    } else {
        res.status(404);
        throw new Error('Car not found');
    }
});

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private (Owner only)
const updateCar = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        res.status(404);
        throw new Error('Car not found');
    }

    // Check if the user trying to update is the owner
    // Note: car.owner is an ObjectId, so we use .toString() to compare
    if (car.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this car');
    }

    // Update the car
    const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true } // Return the updated version, not the old one
    );

    res.json(updatedCar);
});

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private (Owner only)
const deleteCar = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        res.status(404);
        throw new Error('Car not found');
    }

    // Check ownership
    if (car.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to delete this car');
    }

    await car.deleteOne(); // or car.remove() depending on Mongoose version

    res.json({ message: 'Car removed' });
});

// @desc    Get all cars (Public)
// @route   GET /api/cars
// @access  Public
const getAllCars = asyncHandler(async (req, res) => {
    // Only show cars that are Approved AND Available
    const cars = await Car.find({
        // TODO: Uncomment this when Admin Approval workflow is ready
        // status: 'Available',
        // adminApproved: true
    });
    res.status(200).json(cars);
});

module.exports = { createCar, getCarById, updateCar, deleteCar, getAllCars };