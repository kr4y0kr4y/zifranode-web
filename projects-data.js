// Agregar un caso aquí actualiza el índice y el detalle de proyectos.
// Usar fotos solo cuando se conozca con certeza su proyecto de origen.
window.znProjects = [
  {
    id: 'condominio',
    number: '01',
    title: 'Modernización de CCTV y control de acceso en condominio',
    clientType: 'Condominio',
    description: 'Seguridad centralizada, control de acceso renovado e infraestructura lista para crecer.',
    sections: [
      {
        label: 'Desafío',
        text: 'El condominio necesitaba mejorar su sistema de seguridad, centralizar la visualización de cámaras y modernizar el control de acceso principal.'
      },
      {
        label: 'Solución implementada',
        text: 'ZN Technology diseñó e implementó una solución que integró:',
        bullets: ['Cámaras IP', 'NVR de 32 canales', 'Switches PoE', 'Enlaces de fibra óptica entre edificios', 'Racks y respaldo mediante UPS', 'Control de acceso facial', 'Botón no touch', 'Integración con retenedores existentes'],
        note: 'Además, se reorganizó parte de la infraestructura de red y alimentación asociada al sistema.'
      },
      {
        label: 'Resultado',
        text: 'El condominio quedó con una plataforma de seguridad centralizada, mayor orden de infraestructura y una base preparada para futuras ampliaciones de cámaras y control de acceso.'
      }
    ],
    technologies: ['CCTV', 'Control de acceso', 'Fibra óptica', 'Switches PoE', 'UPS'],
    gallery: [
      { src: 'images/web/acceso-entrada.webp', alt: 'Acceso con lector y control instalado en un condominio' },
      { src: 'images/web/acceso-condominio.webp', alt: 'Terminal de control de acceso instalada en un condominio' }
    ]
  },
  {
    id: 'educacion',
    number: '02',
    title: 'Renovación de gateway y conectividad en institución educacional',
    clientType: 'Institución educacional',
    description: 'Un nuevo gateway integrado a la seguridad y arquitectura de red existentes.',
    sections: [
      {
        label: 'Desafío',
        text: 'Una institución educacional necesitaba reemplazar su gateway principal sin alterar la seguridad existente ni interrumpir su operación.'
      },
      {
        label: 'Solución implementada',
        text: 'ZN Technology realizó:',
        bullets: ['Respaldo de la configuración anterior', 'Implementación y adopción de un nuevo gateway empresarial', 'Configuración WAN y LAN', 'DHCP', 'Integración con firewall existente', 'Habilitación mediante módulos SFP', 'Configuración de VPN', 'Aplicación de políticas de acceso y bloqueo de servicios'],
        note: 'Durante la puesta en marcha se resolvieron incidencias asociadas a múltiples enlaces WAN y rutas existentes.'
      },
      {
        label: 'Resultado',
        text: 'La institución quedó con una plataforma de conectividad renovada, integrada con su infraestructura de seguridad y operativa bajo la arquitectura existente.'
      }
    ],
    technologies: ['Gateway empresarial', 'WAN/LAN', 'DHCP', 'SFP', 'VPN', 'Firewall'],
    gallery: []
  },
  {
    id: 'deportivo',
    number: '03',
    title: 'Corrección de problemas WiFi en centro deportivo',
    clientType: 'Centro deportivo',
    description: 'Diagnóstico del cuello de botella y separación de la conectividad inalámbrica.',
    sections: [
      {
        label: 'Desafío',
        text: 'El cliente presentaba intermitencias y bajo rendimiento WiFi en una zona de oficinas. Durante el diagnóstico se identificó que un access point empresarial estaba conectado a un switch utilizado también por cámaras y otros dispositivos, generando un cuello de botella.'
      },
      {
        label: 'Solución implementada',
        text: 'ZN Technology separó ambas infraestructuras mediante:',
        bullets: ['Enlace de fibra óptica', 'Fusión y terminación de fibra', 'Rosetas ópticas', 'Módulos SFP', 'Switch dedicado', 'Configuración de VLAN', 'Reorganización de la conectividad del access point'],
        note: 'También se detectó y corrigió un segundo problema relacionado con redes WiFi superpuestas.'
      },
      {
        label: 'Resultado',
        text: 'Se eliminó el cuello de botella principal y se recuperó la estabilidad del servicio inalámbrico en el sector intervenido.'
      }
    ],
    technologies: ['WiFi empresarial', 'Fibra óptica', 'Switch dedicado', 'VLAN'],
    gallery: []
  },
  {
    id: 'infraestructura-condominio',
    number: '04',
    title: 'Infraestructura de red y respaldo eléctrico en condominio',
    clientType: 'Condominio',
    description: 'Racks distribuidos por sector, enlaces ópticos y respaldo eléctrico independiente.',
    sections: [
      {
        label: 'Desafío',
        text: 'Parte de la infraestructura de comunicaciones estaba distribuida entre distintos edificios y requería una solución más ordenada y resiliente.'
      },
      {
        label: 'Solución implementada',
        text: 'Se implementaron:',
        bullets: ['Tres racks de comunicaciones', 'Switches PoE', 'Enlaces de red entre edificios', 'Fibra óptica monomodo', 'Conversión y terminación óptica', 'PDU', 'Circuitos eléctricos dedicados', 'UPS independientes por rack']
      },
      {
        label: 'Resultado',
        text: 'La infraestructura quedó distribuida de forma más ordenada, con respaldo eléctrico por sector y una arquitectura preparada para cámaras, control de acceso y nuevos servicios de red.'
      }
    ],
    technologies: ['Racks', 'Fibra monomodo', 'Switches PoE', 'PDU', 'UPS'],
    gallery: [
      { src: 'images/web/rack-muro.webp', alt: 'Rack de comunicaciones instalado en muro' },
      { src: 'images/web/rack-detalle.webp', alt: 'Detalle de equipos de red montados en rack' },
      { src: 'images/web/canalizacion.webp', alt: 'Canalización de infraestructura de comunicaciones' }
    ]
  },
  {
    id: 'recuperacion-wifi',
    number: '05',
    title: 'Diagnóstico y recuperación de infraestructura inalámbrica',
    clientType: 'Diagnóstico de red',
    description: 'La causa estaba en la red que sostenía los access points, no solo en la cobertura WiFi.',
    sections: [
      {
        label: 'Desafío',
        text: 'El cliente reportaba problemas de conectividad que inicialmente parecían relacionados únicamente con WiFi.'
      },
      {
        label: 'Diagnóstico realizado',
        text: 'ZN Technology identificó que el problema no estaba solamente en la cobertura inalámbrica, sino en la infraestructura que soportaba los access points. Se detectaron:',
        bullets: ['Equipos conectados a infraestructura limitada', 'Redes superpuestas', 'Uso compartido de switches', 'Problemas de segmentación']
      },
      {
        label: 'Solución',
        text: 'Se corrigió la arquitectura de red, se separaron los servicios y se reorganizó la conectividad.'
      },
      {
        label: 'Resultado',
        text: 'Se mejoró la estabilidad general de la red y se evitó reemplazar equipamiento que no era realmente el origen del problema.'
      }
    ],
    technologies: ['Diagnóstico WiFi', 'Segmentación', 'Redes empresariales'],
    gallery: []
  },
  {
    id: 'cdo',
    number: '06',
    title: 'Canal del Deporte Olímpico (CDO)',
    clientType: 'Referencia institucional · Deporte',
    description: 'Proyecto tecnológico desarrollado y entregado por ZN Technology.',
    sections: [
      {
        label: 'Contexto',
        text: 'ZN Technology participó en un proyecto tecnológico para CDO — Canal del Deporte Olímpico, asociado al ecosistema deportivo nacional.'
      },
      {
        label: 'Ejecución',
        text: 'El proyecto fue desarrollado y entregado por ZN, cumpliendo con el alcance comprometido y cerrando formalmente la prestación del servicio.'
      },
      {
        label: 'Resultado',
        text: 'Proyecto completado y entregado satisfactoriamente, incorporándose como una de las referencias institucionales de ZN Technology.'
      }
    ],
    technologies: [],
    gallery: []
  }
];
