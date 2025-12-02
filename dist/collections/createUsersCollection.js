/**
 * Creates a users collection with SSO cookie authentication fields
 */ export function createUsersCollection(slug, isAdmin = false) {
    return {
        slug,
        admin: {
            useAsTitle: 'email'
        },
        auth: isAdmin ? {
            tokenExpiration: 7200,
            verify: false,
            maxLoginAttempts: 5,
            lockTime: 600000
        } : false,
        fields: [
            {
                name: 'email',
                type: 'email',
                required: true,
                unique: true
            },
            {
                name: 'firstName',
                type: 'text'
            },
            {
                name: 'lastName',
                type: 'text'
            },
            {
                name: 'profilePictureUrl',
                type: 'text'
            }
        ]
    };
}
