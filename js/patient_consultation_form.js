document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('patientForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Capturar el ID del paciente desde el formulario
        const patientId = document.getElementById('patientId').value;

        // Consultar los datos del paciente en el servidor HAPI FHIR
        fetch(`http://localhost:8080/fhir/Patient/${patientId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(patientData => {
            console.log('Patient Data:', patientData);
            displayPatientData(patientData);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un error al consultar los datos del paciente');
        });
    });

    function displayPatientData(patientData) {
        const patientInfoDiv = document.getElementById('patientInfo');
        if (!patientData || !patientData.id) {
            patientInfoDiv.innerHTML = `<p>Paciente no encontrado</p>`;
            return;
        }
        patientInfoDiv.innerHTML = `
            <h2>Datos del Paciente</h2>
            <p>ID: ${patientData.id}</p>
            <p>Nombre: ${patientData.name ? patientData.name[0].given.join(' ') + ' ' + patientData.name[0].family : 'N/A'}</p>
            <p>Género: ${patientData.gender || 'N/A'}</p>
            <p>Fecha de Nacimiento: ${patientData.birthDate || 'N/A'}</p>
        `;
    }
});
