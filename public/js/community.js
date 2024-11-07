    // Description: This file contains the client-side JavaScript code for the community page.
    // It uses Fetch API to send POST requests to the server to create posts, like posts, and comment on posts.
    // It also uses Socket.IO to receive real-time updates when a new post is created, a post is liked, or a comment is added.
    // It also contains functions to toggle the comments section and delete a post.
    const socket = io();

    // Submit post form using AJAX
    document.getElementById('post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const postText = e.target.elements.post.value;
        try {
            const response = await fetch('/community/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post: postText })
            });
            if (response.ok) {
                e.target.elements.post.value = ''; // Clear the textarea
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    });

    // Submit like form using AJAX
    document.querySelectorAll('.like-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            try {
                const response = await fetch(`/community/${postId}/like`, { method: 'POST' });
                if (!response.ok) console.error('Error liking post');
            } catch (error) {
                console.error('Error liking post:', error);
            }
        });
    });

    // Submit comment form using AJAX
    document.querySelectorAll('.add-comment-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            const commentText = e.target.elements.comment.value;
            try {
                const response = await fetch(`/community/${postId}/comment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment: commentText })
                });
                if (response.ok) {
                    e.target.elements.comment.value = ''; // Clear the comment input
                }
            } catch (error) {
                console.error('Error commenting on post:', error);
            }
        });
    });

    // Toggle comments section
    function toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        const toggleButton = commentsSection.previousElementSibling.querySelector('.fas');

        if (commentsSection.style.display === "none" || !commentsSection.style.display) {
            commentsSection.style.display = "block";
            toggleButton.classList.replace("fa-chevron-down", "fa-chevron-up");
        } else {
            commentsSection.style.display = "none";
            toggleButton.classList.replace("fa-chevron-up", "fa-chevron-down");
        }
    }

    // Socket.IO events
    socket.on('newPost', (post) => {
        // Insert new post at the top of the community-container
    });

    socket.on('postLiked', ({ postId, likes }) => {
        document.getElementById(`like-count-${postId}`).innerText = likes;
    });

    socket.on('newComment', ({ postId, comment }) => {
        // Append the new comment to the comments section
        const commentsSection = document.getElementById(`comments-${postId}`);
        const commentHtml = `
            <div class="comment">
                <div class="comment-header">
                    <img src="${comment.commentedBy.photo}" alt="User Photo" class="user-photo">
                    <strong class="comment-author">${comment.commentedBy.fullname}</strong>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `;
        commentsSection.insertAdjacentHTML('beforeend', commentHtml);
        document.getElementById(`comment-count-${postId}`).innerText++;
    });



     // Listen for the postDeleted event
     socket.on('postDeleted', (postId) => {
         const postElement = document.getElementById(`post-${postId}`);
         if (postElement) {
             postElement.remove(); // Remove the post from the DOM
         }
     });

    // Delete post
    async function deletePost(postId) {
        try {
            const response = await fetch(`/community/post/${postId}`, {
                method: 'DELETE'
            });
    
            if (response.status === 200) {
                console.log('Post deleted successfully');
                // Redirect to the community page after successful deletion
                window.location.href = '/community';
            } else {
                alert('Failed to delete post.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
    

    // JavaScript for dropdown functionality
    document.addEventListener('DOMContentLoaded', () => {
        const navOpenBtn = document.querySelector('[data-nav-open-btn]');
        const navbar = document.querySelector('[data-navbar]');
  
        navOpenBtn.addEventListener('click', () => {
          navbar.classList.toggle('active');
        });
      });