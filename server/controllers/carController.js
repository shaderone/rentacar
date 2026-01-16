const Car = require('../models/Car');
const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../config/cloudinary');

// @desc Create a new car (host only)
// @route POST /api/cars
// @access Private (host only)
const createCar = asyncHandler(async (req, res) => {

    // 1: Handle Image Uploads
    let imageFiles = [];
    if (req.files && req.files.length > 0) {
        imageFiles = req.files.map(file => file.path);
    }

    if (!req.files || req.files.length === 0) {
        res.status(400);
        throw new Error('At least one image is required');
    }

    // 2. Create the Car Object
    try {
        const car = await Car.create({
            owner: req.user.id, // from the token - cookie (middleware)
            ...req.body,
            images: imageFiles,
            adminApproved: false // default to false, admin needs to approve later.
        });

        res.status(201).json({
            message: 'Car created successfully, pending admin approval.',
            car
        });

    } catch (err) {
        // If there's an error during car creation, delete uploaded images from Cloudinary to avoid orphaned files
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    await cloudinary.uploader.destroy(file.filename);
                } catch (cleanupErr) {
                    // swallow cleanup errors to ensure original error is returned
                }
            }
        }
        res.status(500);
        throw err; // re-throw the error after cleanup
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

    // Check ownership
    if (car.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to update this car');
    }

    // --- PREPARE DATA ---
    let updatedData = { ...req.body };

    // 🛠️ FIX FOR FEATURES "ONE CHIP" BUG
    // If features comes as a string (from FormData), we must parse it back to an Array
    if (req.body.features) {
        try {
            // Check if it's a stringified array like "['GPS','AC']"
            if (typeof req.body.features === 'string') {
                updatedData.features = JSON.parse(req.body.features);
            }
        } catch (error) {
            // If parsing fails, just wrap it in an array or keep as is
            console.error("Error parsing features:", error);
            updatedData.features = [req.body.features];
        }
    }

    // Handle New Images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path);
        updatedData.images = newImages;
    }

    // Perform Update
    const updatedCar = await Car.findByIdAndUpdate(
        req.params.id,
        updatedData,
        { new: true }
    );

    res.json(updatedCar);
});

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private
const deleteCar = asyncHandler(async (req, res) => {
    const car = await Car.findById(req.params.id)

    if (!car) {
        res.status(404)
        throw new Error('Car not found')
    }

    // 1. Check if req.user exists (set by middleware)
    if (!req.user) {
        res.status(401)
        throw new Error('User not found')
    }

    // 2. CHECK OWNERSHIP
    // ERROR SOURCE: Make sure you use 'req.user.id', NOT 'user.id' here!
    const isOwner = String(car.owner) === String(req.user.id)

    // Fallback for older data
    const isUserFieldMatch = car.user && String(car.user) === String(req.user.id)

    if (!isOwner && !isUserFieldMatch) {
        res.status(401)
        throw new Error('User not authorized to delete this car')
    }

    // 3. DELETE
    await car.deleteOne()

    res.status(200).json({ id: req.params.id })
})

// @desc    Get all cars (Public)
// @route   GET /api/cars
// @access  Public
const getCars = asyncHandler(async (req, res) => {
    // Only show cars that are Approved AND Available
    const cars = await Car.find({
        // TODO: Uncomment this when Admin Approval workflow is ready
        // status: 'Available',
        // adminApproved: true
    });
    res.status(200).json(cars);
});

// @desc    Get cars for logged in host
// @route   GET /api/cars/my-cars
// @access  Private
// get cars for the logged in host
const getMyCars = async (req, res) => {
    try {
        const cars = await Car.find({ owner: req.user.id }).sort({ createdAt: -1 })
        res.status(200).json(cars)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getCars,
    createCar,
    updateCar,
    deleteCar,
    getCarById,
    getMyCars,
}