import supabase from './src/config/supabase.js';

async function seedReviews() {
  try {
    console.log('Starting to seed reviews...');

    // Get existing products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(3);

    if (productsError || !products || products.length === 0) {
      console.error('Error fetching products:', productsError);
      console.log('No products found. Please create products first.');
      return;
    }

    console.log(`Found ${products.length} products to review`);

    // Get existing users, or create demo users if none exist
    let { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(10);

    if (!users || users.length === 0) {
      console.log('No users found. Creating demo users...');
      
      // Create sample users
      const demoUsers = [
        { full_name: 'John Smith', email: 'john@example.com', password_hash: 'demo' },
        { full_name: 'Sarah Johnson', email: 'sarah@example.com', password_hash: 'demo' },
        { full_name: 'Mike Wilson', email: 'mike@example.com', password_hash: 'demo' },
        { full_name: 'Emma Brown', email: 'emma@example.com', password_hash: 'demo' },
        { full_name: 'David Lee', email: 'david@example.com', password_hash: 'demo' }
      ];

      const { data: createdUsers, error: createError } = await supabase
        .from('users')
        .insert(demoUsers)
        .select('id');

      if (createError) {
        console.error('Error creating demo users:', createError);
        return;
      }

      users = createdUsers;
      console.log(`Created ${users.length} demo users`);
    }

    console.log(`Found ${users.length} users for reviews`);

    // Check if reviews already exist
    const { data: existingReviews } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);

    if (existingReviews && existingReviews.length > 0) {
      console.log('Reviews already exist in database. Skipping seed.');
      return;
    }

    // Create sample reviews using actual product and user IDs
    const reviews = [
      {
        product_id: products[0].id,
        user_id: users[0 % users.length].id,
        rating: 5,
        title: 'Absolutely amazing discus fish!',
        comment: 'These discus are the most beautiful fish I\'ve ever seen. The colors are vibrant and they\'re very healthy. Highly recommended!',
        status: 'approved',
        helpful_count: 12
      },
      {
        product_id: products[0].id,
        user_id: users[1 % users.length].id,
        rating: 5,
        title: 'Perfect quality',
        comment: 'Great quality discus fish at excellent prices. Arrived quickly and in perfect condition. Will definitely buy again!',
        status: 'approved',
        helpful_count: 8
      },
      {
        product_id: products[0].id,
        user_id: users[2 % users.length].id,
        rating: 4,
        title: 'Very satisfied',
        comment: 'Good quality fish, though shipping could have been faster. Overall very happy with my purchase.',
        status: 'approved',
        helpful_count: 5
      },
      {
        product_id: products[1]?.id || products[0].id,
        user_id: users[3 % users.length].id,
        rating: 5,
        title: 'Best discus I\'ve owned',
        comment: 'Premium quality! The patterns are stunning and the fish are very active. Worth every penny!',
        status: 'approved',
        helpful_count: 15
      },
      {
        product_id: products[1]?.id || products[0].id,
        user_id: users[4 % users.length].id,
        rating: 5,
        title: 'Excellent service and product',
        comment: 'Fast delivery, excellent packaging, and the fish arrived in perfect health. Customer service is top notch!',
        status: 'approved',
        helpful_count: 9
      },
      {
        product_id: products[2]?.id || products[0].id,
        user_id: users[5 % users.length].id,
        rating: 4,
        title: 'Good quality',
        comment: 'Very nice fish with great coloring. A bit pricey but the quality justifies the cost.',
        status: 'approved',
        helpful_count: 6
      },
      {
        product_id: products[0].id,
        user_id: users[6 % users.length].id,
        rating: 3,
        title: 'Average experience',
        comment: 'Fish is good but took a while to acclimate. Otherwise satisfied with the purchase.',
        status: 'approved',
        helpful_count: 3
      },
      {
        product_id: products[1]?.id || products[0].id,
        user_id: users[7 % users.length].id,
        rating: 5,
        title: 'Highly recommend!',
        comment: 'Beautiful fish, great health, and excellent packaging. This seller is fantastic!',
        status: 'approved',
        helpful_count: 11
      },
      {
        product_id: products[2]?.id || products[0].id,
        user_id: users[8 % users.length].id,
        rating: 5,
        title: 'Stunning colors',
        comment: 'The colors on this discus are absolutely incredible. Best purchase I\'ve made for my aquarium!',
        status: 'approved',
        helpful_count: 14
      },
      {
        product_id: products[0].id,
        user_id: users[9 % users.length].id,
        rating: 4,
        title: 'Very happy',
        comment: 'Great fish, healthy and active. Small issue with packaging but fish was fine. Would buy again!',
        status: 'approved',
        helpful_count: 7
      }
    ];

    // Insert sample reviews
    const { data, error } = await supabase
      .from('reviews')
      .insert(
        reviews.map(review => ({
          ...review,
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date in last 30 days
        }))
      )
      .select();

    if (error) {
      console.error('Error seeding reviews:', error);
      return;
    }

    console.log(`✓ Successfully seeded ${data.length} reviews!`);
    console.log('Reviews are now visible on the Reviews page and product detail pages.');
  } catch (error) {
    console.error('Seed error:', error);
  }
}

seedReviews();
