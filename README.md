# Teleprompter

Instalador de paquetes de configuracion para agentes de IA.

Teleprompter toma una plantilla compartida (recursos + instrucciones de personalizacion), la instala en un repositorio destino y entrega al agente las instrucciones necesarias para que adapte esos recursos al contexto del proyecto.

Hoy aprovisionar una configuracion de agente IA en un repositorio es un proceso manual y fragil: los mantenedores copian archivos sueltos a mano, las colisiones con configuraciones locales se resuelven ad-hoc con riesgo de perder customizaciones, y las mejoras en una plantilla no se propagan de forma confiable a los repos que la consumen. Teleprompter busca que distribuir, instalar y personalizar configuraciones de agentes IA sea reproducible y seguro, sin perder customizaciones locales.

## Licencia

[MIT](LICENSE)
