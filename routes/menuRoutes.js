const express = require("express");
const router = express.Router();

const MenuItem = require("./../models/MenuItem");

router.post("/create", async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const newMenuItem = new MenuItem(data);
    const response = await newMenuItem.save();
    console.log("data saved");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

// get method to get the menu item

router.get("/", async (req, res) => {
  try {
    // Get pagination parameters from query, with default values
    const page = parseInt(req.query.page) || 1; // Default page is 1
    const limit = parseInt(req.query.limit) || 10; // Default limit is 10 items per page
    const skip = (page - 1) * limit;

    // Get sorting parameters from query (optional), default sorting by _id
    const sortField = req.query.sortField || "_id"; // Field to sort by
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1; // Sort order (asc or desc)

    // Build filter object from query parameters
    const filters = {};

    // Filtering by name (partial match)
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: "i" }; // Case-insensitive partial match
    }

    // Filtering by taste (exact match)
    if (req.query.taste) {
      filters.taste = req.query.taste; // Must match "sweet", "spicy", or "sour"
    }

    // Filtering by is_drink (boolean)
    if (req.query.is_drink) {
      filters.is_drink = req.query.is_drink === "true"; // Match true or false
    }

    // Filtering by ingredients (partial match for one ingredient)
    if (req.query.ingredient) {
      filters.ingredients = { $in: [req.query.ingredient] }; // Match any item in the ingredients array
    }

    // Filtering by exact price
    if (req.query.price) {
      filters.price = parseInt(req.query.price); // Match exact price
    }

    // Filtering by num_sales (minSales, maxSales)
    if (req.query.minSales && req.query.maxSales) {
      filters.num_sales = {
        $gte: parseInt(req.query.minSales), // Minimum sales filter
        $lte: parseInt(req.query.maxSales), // Maximum sales filter
      };
    } else if (req.query.minSales) {
      filters.num_sales = {
        $gte: parseInt(req.query.minSales), // Minimum sales filter only
      };
    } else if (req.query.maxSales) {
      filters.num_sales = {
        $lte: parseInt(req.query.maxSales), // Maximum sales filter only
      };
    }

    // Fetch the data with filters, pagination, and sorting
    const data = await MenuItem.find(filters)
      .skip(skip) // Skip items for pagination
      .limit(limit) // Limit the number of items
      .sort({ [sortField]: sortOrder }); // Apply sorting

    // Get total count for pagination information, considering filters
    const totalItems = await MenuItem.countDocuments(filters);

    // Respond with the data and pagination info
    res.status(200).json({
      data,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const menuId = req.params.id;
    const updatedMenuData = req.body;

    const response = await MenuItem.findByIdAndUpdate(menuId, updatedMenuData, {
      new: true,
      runValidators: true,
    });
    if (!response) {
      return res.status(404).json({ error: "menu item not found" });
    }
    console.log("data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const menuId = req.params.id;
    const response = await MenuItem.findByIdAndDelete(menuId);
    if (!response) {
      return res.status(404).json({ error: "menu item not found" });
    }
    console.log("data deleted");
    res.status(200).json({ message: "menu item deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
