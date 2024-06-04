# Usa una imagen base con un servidor web (como Nginx o Apache)
FROM nginx:alpine

# Copia los archivos del proyecto al directorio predeterminado de Nginx
COPY . /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 8888
EXPOSE 8888

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
