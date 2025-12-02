import { handleSSOLogin } from '../lib/auth-handler.js';
import { parseCookies, validateSSOSession } from '../lib/sso-session.js';
/**
 * Get the base URL from the request
 */ function getBaseUrl(req) {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    if (host) {
        return `${protocol}://${host}`;
    }
    return 'http://127.0.0.1:3000';
}
/**
 * Build the login URL with return URL parameter
 */ function buildLoginRedirectUrl(loginUrl, returnUrl) {
    const url = new URL(loginUrl);
    url.searchParams.set('returnUrl', returnUrl);
    return url.toString();
}
/**
 * Create authentication endpoints for the plugin
 */ export function createAuthEndpoints(config, apiPrefix = '/api') {
    const namespace = config.name;
    const endpoints = [
        {
            path: `/${namespace}/auth/login`,
            method: 'get',
            handler: async (req)=>{
                const headers = new Headers();
                const baseUrl = getBaseUrl(req);
                const loginUrl = config.sso.loginUrl;
                const cookies = parseCookies(req.headers);
                const ssoCookie = cookies[config.sso.cookieName];
                if (!ssoCookie) {
                    const returnUrl = `${baseUrl}${apiPrefix}/${namespace}/auth/login`;
                    const redirectUrl = buildLoginRedirectUrl(loginUrl, returnUrl);
                    headers.set('Location', redirectUrl);
                    return new Response(null, {
                        status: 302,
                        headers
                    });
                }
                try {
                    const session = await validateSSOSession(config.sso, ssoCookie);
                    if (!session) {
                        const returnUrl = `${baseUrl}${apiPrefix}/${namespace}/auth/login`;
                        const redirectUrl = buildLoginRedirectUrl(loginUrl, returnUrl);
                        headers.set('Location', redirectUrl);
                        return new Response(null, {
                            status: 302,
                            headers
                        });
                    }
                    await handleSSOLogin(req.payload, config, session, req);
                    const redirectPath = config.successRedirectPath || '/';
                    headers.set('Location', `${baseUrl}${redirectPath}`);
                    return new Response(null, {
                        status: 302,
                        headers
                    });
                } catch (error) {
                    if (config.onError) {
                        await config.onError({
                            error: error,
                            req: req
                        });
                    }
                    const errorPath = config.errorRedirectPath || '/auth/error';
                    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
                    let errorType = 'login_failed';
                    if (errorMessage.includes('Sign-up is not allowed')) {
                        errorType = 'signup_disabled';
                    } else if (errorMessage.includes('SSO session missing email')) {
                        errorType = 'invalid_session';
                    }
                    const returnUrl = `${apiPrefix}/${namespace}/auth/login`;
                    const errorUrl = `${baseUrl}${errorPath}?error=${errorType}&message=${encodeURIComponent(errorMessage)}&returnUrl=${encodeURIComponent(returnUrl)}`;
                    return Response.redirect(errorUrl, 302);
                }
            }
        },
        {
            path: `/${namespace}/auth/logout`,
            method: 'get',
            handler: async (req)=>{
                const baseUrl = getBaseUrl(req);
                const returnUrl = config.useAdmin ? `${baseUrl}/admin/login` : `${baseUrl}/`;
                const logoutUrl = config.sso.logoutUrl;
                const redirectTo = buildLoginRedirectUrl(logoutUrl, returnUrl);
                return new Response(null, {
                    status: 302,
                    headers: {
                        Location: redirectTo
                    }
                });
            }
        },
        {
            path: `/${namespace}/auth/session`,
            method: 'get',
            handler: async (req)=>{
                try {
                    if (req.user) {
                        return Response.json({
                            user: req.user,
                            authenticated: true
                        });
                    } else {
                        return Response.json({
                            authenticated: false
                        });
                    }
                } catch  {
                    return Response.json({
                        error: 'Failed to check session'
                    }, {
                        status: 500
                    });
                }
            }
        }
    ];
    return endpoints;
}
