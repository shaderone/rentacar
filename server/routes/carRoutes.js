const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { createCar, getCarById, updateCar, deleteCar, getAllCars } = require('../controllers/carController');

// Route: /api/cars
router.route('/')
    .get(getAllCars)
    .post(protect, createCar);

// Route: /api/cars/:id
router.route('/:id')
    .get(getCarById)
    .put(protect, updateCar)
    .delete(protect, deleteCar);

module.exports = router;
