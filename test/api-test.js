// Native fetch is available in Node 18+

const BASE_URL = 'http://localhost:3000/v1';
const ALICE_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const BOB_ID = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

async function runTest() {
    try {
        console.log('--- Starting API Integration Test ---\n');

        // 1. Create Post as Alice
        console.log('1. Creating post as Alice...');
        const createRes = await fetch(`${BASE_URL}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-id': ALICE_ID
            },
            body: JSON.stringify({ content: 'Hello Debook!' })
        });

        if (!createRes.ok) {
            throw new Error(`Failed to create post: ${createRes.status} ${await createRes.text()}`);
        }
        const post = await createRes.json();
        console.log('✅ Post created:', post);
        const postId = post.id;

        // 2. Like Post as Bob
        console.log(`\n2. Bob liking post ${postId}...`);
        const likeRes = await fetch(`${BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'x-user-id': BOB_ID }
        });

        if (!likeRes.ok) {
            throw new Error(`Failed to like post: ${likeRes.status} ${await likeRes.text()}`);
        }
        console.log('✅ Post liked successfully');

        // 3. Verify Counters (Get Post)
        console.log('\n3. Verifying post counters...');
        const getRes = await fetch(`${BASE_URL}/posts/${postId}`, {
            headers: { 'x-user-id': ALICE_ID }
        });
        const updatedPost = await getRes.json();
        console.log('Post state:', updatedPost);

        if (updatedPost.likesCount === 1) {
            console.log('✅ Counter verified: likesCount is 1');
        } else {
            console.error('❌ Counter mismatch: expected 1, got', updatedPost.likesCount);
        }

        // 4. Verify Idempotence (Bob likes again)
        console.log('\n4. Bob liking post again (Idempotency check)...');
        const likeAgainRes = await fetch(`${BASE_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: { 'x-user-id': BOB_ID }
        });
        if (likeAgainRes.ok) {
            console.log('✅ Second like request accepted (idempotent)');
        } else {
            console.log('❓ Second like request response:', likeAgainRes.status);
        }

        const checkAgainRes = await fetch(`${BASE_URL}/posts/${postId}`, {
            headers: { 'x-user-id': ALICE_ID }
        });
        const checkAgainPost = await checkAgainRes.json();
        if (checkAgainPost.likesCount === 1) {
            console.log('✅ Counter remains 1 after duplicate like');
        } else {
            console.error('❌ Counter failed idempotency check:', checkAgainPost.likesCount);
        }

        // 5. Verify Notifications
        console.log('\n5. Checking notifications for Alice...');
        // Wait a bit for async queue
        await new Promise(r => setTimeout(r, 2000));

        const notifRes = await fetch(`${BASE_URL}/notifications`, {
            headers: { 'x-user-id': ALICE_ID }
        });
        const notifications = await notifRes.json();
        console.log('Notifications:', JSON.stringify(notifications, null, 2));

        const likeNotif = notifications.find(n => n.type === 'post_liked' && n.data.postId === postId && n.data.likedBy === BOB_ID);
        if (likeNotif) {
            console.log('✅ Notification found for post like');
        } else {
            console.error('❌ Notification NOT found');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

runTest();
