import { http, HttpResponse } from 'msw';

export const userHandlers = [
  http.post('/api/register', async ({ request }) => {
    const body = (await request.json()) as { email: string };
    if (body.email === 'taken@test.com') {
      return HttpResponse.json(
        { message: 'Email already taken' },
        { status: 400 },
      );
    }
    return HttpResponse.json({ id: crypto.randomUUID() });
  }),
];
