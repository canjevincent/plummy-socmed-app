import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  // Get pagination parameters from query
  const query = getQuery(event);
  const skip = parseInt(query.skip as string) || 0;
  const take = parseInt(query.take as string) || 5; // Default to 5 if not specified
  
  // Optional: Get user session for personalized content
  await requireUserSession(event);
  const session = await getUserSession(event);
  const userId = session?.user?.id;
  
  try {
    // Fetch posts with pagination
    const posts = await prisma.post.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc' // Most recent posts first
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
        // You can add more relations here as needed
        // likes: true,
        // comments: true,
      }
    });
    
    // Transform the data to match your frontend needs
    const transformedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        id: post.user.id,
        name: `${post.user.firstName} ${post.user.lastName}`,
        avatar: post.user.avatarUrl || ''
      },
      images: post.postImages?.map(img => ({
        id: img.id,
        postId: img.postId,
        url: img.url
      })) || [],
      // Add other transformations as needed
    }));
    
    return transformedPosts;
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch posts"
    });
  }
});