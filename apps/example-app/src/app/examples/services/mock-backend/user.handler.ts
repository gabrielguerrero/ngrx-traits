import { http, HttpResponse } from 'msw';

const takenEmails = ['taken@test.com'];

export const userHandlers = [
  http.get('/api/check-email', ({ request }) => {
    const email = new URL(request.url).searchParams.get('email') ?? '';
    return HttpResponse.json({
      email,
      available: !takenEmails.includes(email),
    });
  }),
  http.post('/api/register', async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (takenEmails.includes(body.email)) {
      return HttpResponse.json(
        { message: 'Email already taken' },
        { status: 400 },
      );
    }
    return HttpResponse.json({ id: crypto.randomUUID() });
  }),
];
