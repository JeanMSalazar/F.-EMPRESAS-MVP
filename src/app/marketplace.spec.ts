import { TestBed } from '@angular/core/testing';
import { Marketplace, PUBLIC_CONFIG } from './marketplace';

// Exercises the same commands used by the two role views, without a Supabase project.
describe('marketplace demo transaction', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: PUBLIC_CONFIG, useValue: { url: '', anon_key: '' } }],
    });
  });
  afterEach(() => TestBed.resetTestingModule());

  it('completes a client-to-master service and permits a review only after completion', async () => {
    const market = TestBed.inject(Marketplace);
    market.demo_as('client');
    const quote = market.quotes().find((item) => item.id === 'quote-demo')!;
    await market.decide_quote(quote, true);
    const service = market.services().find((item) => item.request_id === 'request-demo')!;
    expect(service.status).toBe('ACCEPTED');
    await expect(market.add_review(service, 5, 'Muy buen trabajo')).rejects.toThrow('completado');

    market.demo_as('professional');
    await market.update_service(service, 'on_the_way');
    await market.update_service(
      market.services().find((item) => item.id === service.id)!,
      'complete',
    );
    expect(market.services().find((item) => item.id === service.id)?.status).toBe('COMPLETED');

    market.demo_as('client');
    await market.add_review(
      market.services().find((item) => item.id === service.id)!,
      5,
      'Muy buen trabajo',
    );
    expect(
      market
        .reviews()
        .some((item) => item.service_id === service.id && item.reviewer_id === 'client-demo'),
    ).toBe(true);
  });

  it('keeps the old price as a superseded quote when a master sends a revision', async () => {
    const market = TestBed.inject(Marketplace);
    market.demo_as('professional');
    const request = market.requests().find((item) => item.id === 'request-demo')!;
    await market.send_quote(request, 110, 'Incluye nueva pieza', 'Precio actualizado');
    expect(market.quotes().find((item) => item.id === 'quote-demo')?.status).toBe('SUPERSEDED');
    expect(
      market.quotes().find((item) => item.request_id === request.id && item.version === 2)?.price,
    ).toBe(110);
  });

  it('requires a new acceptance after an accepted price changes', async () => {
    const market = TestBed.inject(Marketplace);
    market.demo_as('client');
    await market.decide_quote(market.quotes().find((item) => item.id === 'quote-demo')!, true);
    const original_service = market.services().find((item) => item.request_id === 'request-demo')!;

    market.demo_as('professional');
    await market.send_quote(
      market.requests().find((item) => item.id === 'request-demo')!,
      110,
      'Nuevo repuesto necesario',
      'Precio actualizado',
    );
    expect(market.services().find((item) => item.id === original_service.id)?.status).toBe('QUOTED');
    expect(market.quotes().find((item) => item.id === 'quote-demo')?.status).toBe('SUPERSEDED');

    market.demo_as('client');
    const revision = market.quotes().find((item) => item.version === 2)!;
    await market.decide_quote(revision, true);
    expect(market.services().filter((item) => item.request_id === 'request-demo')).toHaveLength(1);
    expect(market.services().find((item) => item.id === original_service.id)?.quote_id).toBe(
      revision.id,
    );
  });
});
