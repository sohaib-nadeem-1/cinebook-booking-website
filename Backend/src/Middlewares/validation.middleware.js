export const validateMovie = (req, res, next) => {
    const {
        title,
        runtime,
        release_date,
        age_rating,
        status,
        director,
        language,
        genres,
        formats,
        poster_url,
        synopsis
    } = req.body;

    // Required fields
    if (!title || !runtime || !age_rating || !status) {
        return res.status(400).json({
            message: "Title, runtime, age_rating and status are required"
        });
    }

    // Title validation
    if (typeof title !== "string" || title.trim() === "") {
        return res.status(400).json({
            message: "Title must be a non-empty string"
        });
    }

    // Runtime validation
    if (typeof runtime !== "number" || runtime <= 0) {
        return res.status(400).json({
            message: "Runtime must be a positive number"
        });
    }

    // Age rating validation
    const allowedAgeRatings = [
        "G",
        "PG",
        "PG-13",
        "R",
        "NC-17"
    ];

    if (!allowedAgeRatings.includes(age_rating)) {
        return res.status(400).json({
            message: "Invalid age rating"
        });
    }

    // Status validation
    const allowedStatuses = [
        "Coming Soon",
        "Now Showing",
        "Ended"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: "Invalid movie status"
        });
    }

    // Genres validation
    if (genres !== undefined && !Array.isArray(genres)) {
        return res.status(400).json({
            message: "Genres must be an array"
        });
    }

    // Formats validation
    if (formats !== undefined && !Array.isArray(formats)) {
        return res.status(400).json({
            message: "Formats must be an array"
        });
    }

    next();
};