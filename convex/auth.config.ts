export default {
    providers: [
        {
            // Must match BETTER_AUTH_URL on your vibe_auth instance
            // Set VIBE_AUTH_URL in Convex Dashboard > Settings > Environment Variables
            domain: process.env.VIBE_AUTH_URL!,
            applicationID: "convex",
        },
    ],
}
