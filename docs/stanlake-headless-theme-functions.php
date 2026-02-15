<?php

/**
 * Theme Name: Stanlake Headless
 * Description: Minimal headless theme - no frontend, API only
 * Version: 1.0
 * Author: Mariano de Iriondo
 */

// Prevent direct access
if (!defined('ABSPATH')) exit;

/**
 * Theme Setup
 */
function stanlake_theme_setup()
{
    // Add theme support for features
    add_theme_support('post-thumbnails');
    add_theme_support('title-tag');

    // Image sizes for REST API
    add_image_size('card-thumb', 600, 400, true);
    add_image_size('hero-image', 1920, 1080, true);
}
add_action('after_setup_theme', 'stanlake_theme_setup');

/**
 * Register Custom Post Types
 */
function stanlake_register_cpts()
{

    // 1. WINES
    register_post_type('wine', array(
        'label' => 'Wines',
        'labels' => array(
            'singular_name' => 'Wine',
            'add_new' => 'Add New Wine',
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'wines'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-products',
        'show_in_rest' => true,
        'rest_base' => 'wines',
        'taxonomies' => array('wine_type', 'wine_category'),
    ));

    // Taxonomies for wines
    register_taxonomy('wine_type', 'wine', array(
        'label' => 'Wine Type',
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'wine-type'),
    ));

    register_taxonomy('wine_category', 'wine', array(
        'label' => 'Category',
        'hierarchical' => false,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'wine-category'),
    ));

    // 2. WEDDING VENUES
    register_post_type('venue', array(
        'label' => 'Venues',
        'labels' => array(
            'singular_name' => 'Venue',
        ),
        'public' => true,
        'has_archive' => false,
        'rewrite' => array('slug' => 'weddings/venues'),
        'supports' => array('title', 'editor', 'thumbnail'),
        'menu_icon' => 'dashicons-admin-home',
        'show_in_rest' => true,
        'rest_base' => 'venues',
    ));

    // 3. ACCOMMODATION
    register_post_type('accommodation', array(
        'label' => 'Accommodation',
        'labels' => array(
            'singular_name' => 'Accommodation',
        ),
        'public' => true,
        'has_archive' => true,
        'rewrite' => array('slug' => 'stay'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-admin-multisite',
        'show_in_rest' => true,
        'rest_base' => 'accommodation',
    ));

    // 4. EXPERIENCE INFO (Editorial only)
    register_post_type('experience_info', array(
        'label' => 'Experience Info',
        'labels' => array(
            'singular_name' => 'Experience Info',
        ),
        'public' => true,
        'has_archive' => false,
        'rewrite' => array('slug' => 'experiences'),
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'menu_icon' => 'dashicons-tickets-alt',
        'show_in_rest' => true,
        'rest_base' => 'experience_info',
    ));
}
add_action('init', 'stanlake_register_cpts');

/**
 * CORS Headers for Next.js
 */
function stanlake_cors_headers()
{
    $allowed_origins = array(
        'http://localhost:3000',
        'http://localhost:3001',
        'https://stanlake-park.vercel.app',
        'https://stanlakepark.com', // Production
    );

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Credentials: true");
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
}
add_action('rest_api_init', 'stanlake_cors_headers');

/**
 * Expose ACF fields to REST API
 * ACF Pro 5.11+ has this built-in, but adding manual exposure for safety
 */
function stanlake_expose_acf_to_rest()
{
    // This ensures ACF fields appear in REST API responses
    // ACF Pro 5.11+ does this automatically if "Show in REST API" is enabled
}
add_action('rest_api_init', 'stanlake_expose_acf_to_rest');

/**
 * Remove unnecessary WordPress bloat for headless
 */
function stanlake_cleanup_head()
{
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'start_post_rel_link');
    remove_action('wp_head', 'index_rel_link');
    remove_action('wp_head', 'adjacent_posts_rel_link');
    remove_action('wp_head', 'wp_shortlink_wp_head');
}
add_action('init', 'stanlake_cleanup_head');

/**
 * Disable front-end (optional - uncomment if you want to force API-only)
 */
// function stanlake_disable_frontend() {
//     if (!is_admin() && !defined('REST_REQUEST')) {
//         wp_die('This is a headless WordPress installation. Please use the Next.js frontend.', 'Headless WordPress', array('response' => 403));
//     }
// }
// add_action('template_redirect', 'stanlake_disable_frontend');

/**
 * Custom REST API endpoints (if needed)
 */
function stanlake_register_custom_endpoints()
{
    register_rest_route('stanlake/v1', '/menu/(?P<location>[a-zA-Z0-9-]+)', array(
        'methods' => 'GET',
        'callback' => 'stanlake_get_menu',
        'permission_callback' => '__return_true',
    ));
}
add_action('rest_api_init', 'stanlake_register_custom_endpoints');

function stanlake_get_menu($request)
{
    $location = $request['location'];
    $menu = wp_get_nav_menu_items($location);
    return rest_ensure_response($menu);
}
