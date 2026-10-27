import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Marketplace } from './marketplace';
import { Professional } from './models';

const CATEGORY_CARDS = [
  { icon: '◉', title: 'Gasfitería', note: 'Fugas, grifería y más', color: 'mint' },
  { icon: 'ϟ', title: 'Electricidad', note: 'Instalación y reparación', color: 'peach' },
  { icon: '✳', title: 'Pintura', note: 'Dale vida a tus espacios', color: 'lavender' },
  { icon: '▣', title: 'Carpintería', note: 'Muebles y acabados', color: 'sand' },
  { icon: '✦', title: 'Limpieza', note: 'Tu casa como nueva', color: 'blue' },
  { icon: '⌂', title: 'Albañilería', note: 'Construcción y mejoras', color: 'rose' },
];

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> TU HOGAR EN BUENAS MANOS</div>
          <h1>Ese arreglo pendiente, <em>resuelto.</em></h1>
          <p>
            Encuentra maestros de tu zona, compara propuestas y vuelve a disfrutar de tu casa.
            Fácil, cercano y a tu ritmo.
          </p>
          <div class="hero-actions">
            <a class="button button-primary button-large" routerLink="/solicitar"
              >Solicitar un servicio <span>↗</span></a
            ><a class="hero-link" routerLink="/como-funciona">Mira cómo funciona <span>→</span></a>
          </div>
          <div class="hero-proof">
            <div class="avatar-stack"><span>LM</span><span>RQ</span><span>CV</span></div>
            <div>
              <strong>Maestros de Arequipa</strong><small>Listos para ayudarte cerca de casa</small>
            </div>
          </div>
        </div>
        <div class="hero-art" aria-label="Ilustración de una vivienda y tarjeta de profesional">
          <div class="art-sun"></div>
          <div class="art-arch"></div>
          <div class="art-floor"></div>
          <div class="art-wall"></div>
          <div class="art-window"><span></span><span></span><span></span><span></span></div>
          <div class="art-frame"></div>
          <div class="art-cabinet"><span></span><span></span></div>
          <div class="art-plant"><span></span><span></span><span></span></div>
          <div class="art-person">
            <div class="person-head"></div>
            <div class="person-body"></div>
            <div class="person-arm"></div>
            <div class="person-leg left"></div>
            <div class="person-leg right"></div>
            <div class="person-tool">✦</div>
          </div>
          <div class="floating-card">
            <div class="mini-avatar">LM</div>
            <div>
              <strong>Luis Medina</strong><small>Gasfitería · Yanahuara</small
              ><span>★ 4.9 <i>· Disponible hoy</i></span>
            </div>
            <b>✓</b>
          </div>
          <div class="art-sticker">✳</div>
        </div>
      </div>
    </section>
    <section class="trust-line">
      <div class="container trust-line-grid">
        <span
          >✦ <strong>Gente de tu ciudad</strong><small>Conoce a quien entra a tu hogar</small></span
        ><span>◎ <strong>Elige con calma</strong><small>Compara antes de decidir</small></span
        ><span
          >◈ <strong>Tu experiencia cuenta</strong
          ><small>Califica el trabajo realizado</small></span
        >
      </div>
    </section>
    <section class="section section-categories">
      <div class="container">
        <div class="section-heading">
          <div>
            <div class="eyebrow">ENCUENTRA LO QUE NECESITAS</div>
            <h2>Una mano para <em>cada cosa.</em></h2>
            <p>Desde una pequeña reparación hasta ese proyecto que llevas tiempo imaginando.</p>
          </div>
          <a class="link-arrow" routerLink="/explorar">Ver todos los maestros <span>↗</span></a>
        </div>
        <div class="category-grid">
          @for (category of categories; track category.title) {
            <a
              class="category-card"
              [class]="'category-card ' + category.color"
              routerLink="/explorar"
              [queryParams]="{ especialidad: category.title }"
              ><span class="category-icon">{{ category.icon }}</span
              ><strong>{{ category.title }}</strong
              ><small>{{ category.note }}</small
              ><span class="category-arrow">↗</span></a
            >
          }
        </div>
      </div>
    </section>
    <section class="section how-section">
      <div class="container how-grid">
        <div class="how-visual">
          <div class="how-visual-inner">
            <span class="how-sparkle">✴</span>
            <div class="how-request">
              <small>NUEVA SOLICITUD</small><strong>Arreglar una fuga de agua</strong
              ><span>◉ Yanahuara, Arequipa</span>
              <div class="how-request-bottom"><span>Enviada a maestros cercanos</span><b>✓</b></div>
            </div>
            <div class="how-quote">
              <span class="quote-icon">✦</span>
              <div>
                <strong>¡Llegó una propuesta!</strong><small>Revisa el precio y los detalles</small>
              </div>
              <span>→</span>
            </div>
          </div>
        </div>
        <div class="how-copy">
          <div class="eyebrow">ASÍ DE SENCILLO</div>
          <h2>De “hay que arreglarlo” a <em>“ya quedó”.</em></h2>
          <div class="steps">
            <div>
              <span>01</span>
              <div>
                <h3>Cuéntanos qué necesitas</h3>
                <p>Describe el trabajo, marca la ubicación y agrega fotos si quieres.</p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <h3>Recibe propuestas</h3>
                <p>Maestros de tu zona te envían su precio y plan de trabajo.</p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <h3>Elige y listo</h3>
                <p>Acepta la opción que más te convenga y califica al terminar.</p>
              </div>
            </div>
          </div>
          <a class="button button-dark" routerLink="/solicitar"
            >Publicar mi solicitud <span>↗</span></a
          >
        </div>
      </div>
    </section>
    <section class="section pro-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <div class="eyebrow">PERSONAS REALES, TRABAJO BIEN HECHO</div>
            <h2>Conoce a nuestros <em>maestros.</em></h2>
            <p>La mejor recomendación empieza con un buen trabajo.</p>
          </div>
          <a class="link-arrow" routerLink="/explorar">Explorar perfiles <span>↗</span></a>
        </div>
        <div class="featured-grid">
          @for (pro of featured(); track pro.id) {
            <a class="pro-card" [routerLink]="['/profesional', pro.id]"
              ><div
                class="pro-cover"
                [class]="
                  pro.specialty === 'Gasfitería'
                    ? 'cover-mint'
                    : pro.specialty === 'Electricidad'
                      ? 'cover-peach'
                      : 'cover-lavender'
                "
              >
                <span>{{
                  pro.specialty === 'Gasfitería'
                    ? '◉'
                    : pro.specialty === 'Electricidad'
                      ? 'ϟ'
                      : '✳'
                }}</span>
                <div class="pro-avatar">
                  @if (pro.photo_url) {
                    <img [src]="pro.photo_url" [alt]="pro.full_name" />
                  } @else {
                    {{ initials(pro.full_name) }}
                  }
                </div>
              </div>
              <div class="pro-card-body">
                <div class="pro-card-top">
                  <strong>{{ pro.full_name }}</strong
                  ><span>★ {{ pro.rating }}</span>
                </div>
                <small>{{ pro.specialty }} · {{ pro.zone }}</small>
                <p>{{ pro.bio }}</p>
                <div class="pro-card-foot">
                  <span>{{ pro.completed_count }} trabajos completados</span><b>Ver perfil ↗</b>
                </div>
              </div></a
            >
          }
        </div>
      </div>
    </section>
    <section class="dual-cta">
      <div class="container dual-cta-inner">
        <div class="dual-cta-art">✳</div>
        <div>
          <div class="eyebrow">PARA LOS QUE SABEN HACERLO</div>
          <h2>¿Eres maestro? Tu próximo trabajo podría estar aquí.</h2>
          <p>Crea tu perfil gratis, conecta con hogares cerca de ti y haz crecer tu reputación.</p>
        </div>
        <a class="button button-light" routerLink="/maestros">Conocer beneficios <span>↗</span></a>
      </div>
    </section>
  `,
})
export class LandingPage {
  readonly market = inject(Marketplace);
  readonly categories = CATEGORY_CARDS;
  featured(): Professional[] {
    return this.market.professionals().slice(0, 3);
  }
  initials(value: string): string {
    return value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}

@Component({
  selector: 'app-masters-landing',
  imports: [RouterLink],
  template: `
    <section class="master-hero">
      <div class="container master-hero-grid">
        <div>
          <div class="eyebrow eyebrow-light">TU OFICIO MERECE CRECER</div>
          <h1>Más clientes cerca.<br /><em>Más oportunidades</em> para ti.</h1>
          <p>
            Crea tu perfil gratis y conecta con personas en Arequipa que necesitan exactamente lo
            que sabes hacer.
          </p>
          <div class="hero-actions">
            <a
              class="button button-cream button-large"
              routerLink="/registro"
              [queryParams]="{ rol: 'professional' }"
              >Regístrate como maestro <span>↗</span></a
            ><a
              class="master-secondary"
              routerLink="/ingresar"
              [queryParams]="{ rol: 'professional' }"
              >Ya tengo cuenta →</a
            >
          </div>
          <div class="master-hero-stats">
            <span><strong>Gratis</strong><small>para empezar</small></span
            ><span><strong>Local</strong><small>clientes de tu zona</small></span
            ><span><strong>Simple</strong><small>sin comisiones en el MVP</small></span>
          </div>
        </div>
        <div class="master-card-scene">
          <div class="master-circle"></div>
          <div class="master-tool">✳</div>
          <div class="master-sample-card">
            <div class="master-avatar">LM</div>
            <div class="master-sample-heading"><strong>Luis Medina</strong><span>★ 4.9</span></div>
            <p>Gasfitería · Yanahuara</p>
            <div class="master-sample-chips"><span>✓ Disponible</span><span>48 trabajos</span></div>
            <div class="master-sample-notice">
              <b>✦</b
              ><span>¡Nueva solicitud cerca de ti!<small>Reparar fuga · Yanahuara</small></span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="center-heading">
          <div class="eyebrow">HECHO PARA MAESTROS COMO TÚ</div>
          <h2>Tu trabajo habla por ti.<br /><em>Nosotros ayudamos a que se vea.</em></h2>
        </div>
        <div class="benefits-grid">
          <article>
            <span>01 ✦</span>
            <h3>Clientes nuevos, cerca de ti</h3>
            <p>Recibe solicitudes de hogares en tu zona y elige los trabajos que te convienen.</p>
          </article>
          <article>
            <span>02 ◈</span>
            <h3>Tu reputación, en un lugar</h3>
            <p>Muestra tu experiencia, tus trabajos terminados y las opiniones de tus clientes.</p>
          </article>
          <article>
            <span>03 ◎</span>
            <h3>Tú decides tu precio</h3>
            <p>Envía una cotización clara. El cliente la revisa y acepta antes de empezar.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="master-how">
      <div class="container">
        <div class="section-heading">
          <div>
            <div class="eyebrow">EMPIEZA EN MINUTOS</div>
            <h2>Así funciona para ti.</h2>
          </div>
        </div>
        <div class="master-steps">
          <div>
            <b>1</b>
            <h3>Crea tu perfil</h3>
            <p>Cuenta qué haces, dónde trabajas y tu experiencia.</p>
          </div>
          <div>
            <b>2</b>
            <h3>Encuentra solicitudes</h3>
            <p>Revisa trabajos nuevos de tu especialidad.</p>
          </div>
          <div>
            <b>3</b>
            <h3>Cotiza y trabaja</h3>
            <p>Envía tu propuesta, realiza el servicio y gana reseñas.</p>
          </div>
        </div>
      </div>
    </section>
    <section class="master-final">
      <div class="container">
        <span>✳</span>
        <h2>Tu próximo cliente está más cerca<br />de lo que imaginas.</h2>
        <p>Únete a ManoCerca y dale a tu oficio un espacio para crecer.</p>
        <a
          class="button button-primary button-large"
          routerLink="/registro"
          [queryParams]="{ rol: 'professional' }"
          >Crear mi perfil gratis ↗</a
        >
      </div>
    </section>
  `,
})
export class MastersLandingPage {}

@Component({
  selector: 'app-how',
  imports: [RouterLink],
  template: `
    <section class="page-hero simple-hero">
      <div class="container">
        <div class="eyebrow">CÓMO FUNCIONA</div>
        <h1>Conectar con la ayuda correcta<br /><em>debería ser sencillo.</em></h1>
        <p>
          ManoCerca une a hogares de Arequipa con maestros de su zona. Tú mantienes el control de
          cada paso.
        </p>
      </div>
    </section>
    <section class="section">
      <div class="container flow-grid">
        <article>
          <span>01</span>
          <h2>Publica lo que necesitas</h2>
          <p>
            Elige una especialidad, describe el trabajo y marca el lugar en el mapa. Puedes agregar
            fotos para que los maestros entiendan mejor.
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>Revisa las cotizaciones</h2>
          <p>
            Recibe propuestas con precio y alcance. Compara con calma y acepta la que prefieras.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>Sigue el servicio</h2>
          <p>
            Consulta si el maestro va en camino. Cuando termina el trabajo, queda registrado en tu
            historial.
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>Comparte tu experiencia</h2>
          <p>
            Califica el trabajo y ayuda a otros hogares a elegir. Si te gustó, puedes volver a
            contratar al mismo maestro.
          </p>
        </article>
      </div>
    </section>
    <section class="simple-cta">
      <div class="container">
        <h2>¿Empezamos con eso que falta arreglar?</h2>
        <a class="button button-primary button-large" routerLink="/solicitar"
          >Solicitar un servicio ↗</a
        >
      </div>
    </section>
  `,
})
export class HowPage {}
