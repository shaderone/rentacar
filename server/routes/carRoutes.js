const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Note: Ensure these import names match your controller exports exactly!
const {
    getCars,
    createCar,
    updateCar,
    deleteCar,
    getCarById, // Changed from getCarById to match your likely controller export
    getMyCars,
} = require('../controllers/carController');

// Route: /api/cars
router.route('/')
    .get(getCars)
    .post(protect, upload.array('images', 5), createCar);

router.get('/my-cars', protect, getMyCars)
// Route: /api/cars/:id
router.route('/:id')
    .get(getCarById)
    // 👇 THIS WAS THE MISSING PIECE
    .put(protect, upload.array('images', 5), updateCar)
    .delete(protect, deleteCar);


module.exports = router;