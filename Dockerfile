# Usa una imagen base con un servidor web (como Nginx o Apache)
FROM nginx:alpine

# Copia los archivos del proyecto al directorio predeterminado de Nginx
COPY . /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para ejecutar Nginx
CMD ["nginx", "-g", "daemon off;"]
