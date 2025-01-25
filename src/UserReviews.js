import React, { useState } from 'react';

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState('');

    // Extra Console Logs
    console.log("Current Reviews:", reviews);
    console.log("New Review:", newReview);

    const handleReviewSubmit = () => {
        // Submit new review to existing reviews array
        setReviews([...reviews, newReview]);
        setNewReview('');
    };

    return (
        <div>
            <h2>User Review</h2>
            <ul>
                {reviews.map((review, index) => (
                    <li key={index}>{review}</li>
                ))}
            </ul>
            <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
            placeholder="Write your review..."
            />
            <button onClick={handleReviewSubmit}>Submit Review</button>    
        </div>
    );
};

export default UserReviews
