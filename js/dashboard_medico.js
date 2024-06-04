document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutButton').addEventListener('click', function() {
        alert('Has cerrado sesión.');
        // Aquí agregar la lógica para cerrar sesión, por ejemplo, redirigir a la página de inicio de sesión.
    });

    document.getElementById('consultPatient').addEventListener('click', function(event) {
        event.preventDefault();
        loadPatientConsultationForm();
    });

    document.getElementById('newPatient').addEventListener('click', function(event) {
        event.preventDefault();
        loadNewPatientForm();
    });

    document.getElementById('personalData').addEventListener('click', function(event) {
        event.preventDefault();
        loadPersonalDataForm();
    });

    function loadPatientConsultationForm() {
        document.getElementById('container-home').style.display = "none";
        document.getElementById('container-consultation').style.display = 'block';
        document.getElementById('container-new').style.display = 'none';
        document.getElementById('container-personal-data').style.display = "none";
        
    }

    function loadNewPatientForm() {
        document.getElementById('container-home').style.display = "none";
        document.getElementById('container-consultation').style.display = 'none';
        document.getElementById('container-new').style.display = 'block';
        document.getElementById('container-personal-data').style.display = "none";
    }

    function loadPersonalDataForm() {
        document.getElementById('container-consultation').style.display = 'none';
        document.getElementById('container-new').style.display = 'none';
        document.getElementById('container-personal-data').style.display = "block";
    }

    document.getElementById('fhirForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        // Capturar los datos del formulario
        const patientNacionalidad = document.getElementById('patientNacionalidad').value;
        const patientDNI = document.getElementById('patientDNI').value;
        const patientName = document.getElementById('patientName').value;
        const patientLastName = document.getElementById('patientLastName').value;
        const patientBirthDate = document.getElementById('patientBirthDate').value;
        const patientSexo = document.getElementById('patientSexo').value;
        const patientGender = document.getElementById('patientGender').value;
        const patientOcupation = document.getElementById('patientOcupation').value;
        const patientVoluntad = document.getElementById('patientVoluntad').value;
        const patientDiscapacidad = document.getElementById('patientDiscapacidad').value;
        const patientResidentActual = document.getElementById('patientResidentActual').value;
        const patientMunipioActual = document.getElementById('patientMunipioActual').value;
        const patientPertEtnica = document.getElementById('patientPertEtnica').value;
        const patientZonaTerritorial = document.getElementById('patientZonaTerritorial').value;
        const patientEntidadRespondiente = document.getElementById('patientEntidadRespondiente').value;

        // Crear el recurso Patient en formato FHIR
        const patientResource = {
            resourceType: "Patient",
            identifier: [{
                system: "http://localhost:8080/patient-ids",
                value: patientDNI
            }],
            name: [{
                given: [patientName],
                family: patientLastName
            }],
            birthDate: patientBirthDate,
            gender: patientGender.toLowerCase(),
            extension: [
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/nationality",
                    valueString: patientNacionalidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/sex",
                    valueString: patientSexo
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/occupation",
                    valueString: patientOcupation
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/advanced-directive",
                    valueString: patientVoluntad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/disability",
                    valueString: patientDiscapacidad
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/address",
                    valueAddress: {
                        country: patientResidentActual,
                        city: patientMunipioActual
                    }
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/ethnicity",
                    valueString: patientPertEtnica
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/residence-area",
                    valueString: patientZonaTerritorial
                },
                {
                    url: "http://localhost:8080/fhir/StructureDefinition/responding-entity",
                    valueString: patientEntidadRespondiente
                }
            ]
        };

        // Enviar los datos al servidor FHIR
        try {
            const response = await fetch('http://localhost:8080/fhir/Patient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/fhir+json'
                },
                body: JSON.stringify(patientResource)
            });


            if (response.ok) {
                const data = await response.json();
                console.log('Success:', data);
                alert('Datos enviados con éxito');
                this.reset();
            } else {
                const errorText = await response.text(); // Capturar el texto del error
                console.error('Error:', errorText || response.statusText);
                alert(`Error al enviar los datos: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al enviar los datos');
        }
    });


    // Consulta datos del paciente por Numero de Identificacion
    document.getElementById('searchButton').addEventListener('click', function() {
        let patientDNIConsult = document.getElementById('patientDNIConsult').value.trim();

        if (patientDNIConsult === '') {
            alert('Por favor, ingrese un número de identificación válido.');
            return;
        }

        // Realizar la solicitud al servidor con el número de identificación como parámetro de búsqueda
        fetch(`http://localhost:8080/fhir/Patient?identifier=${patientDNIConsult}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('La solicitud no fue exitosa');
                }
                return response.json();
            })
            .then(data => {
                // Mostrar los datos del paciente
                displayPatientInfo(data);
            })
            .catch(error => {
                //console.error('Error al consultar los datos del paciente:', error);
                // Mostrar un mensaje de error al usuario
                alert("Identificación no registrada!");
                // Ocultar la sección de detalles del paciente en caso de error
                document.getElementById('patientDetails').classList.add('d-none');
                document.getElementById('editPatientFormContainer').classList.add('d-none');
                document.getElementById('patientDNIConsult').value = '';
            });
    });

    
    function displayPatientInfo(patientData) {
        const patientInfoDiv = document.getElementById('patientInfo');
        patientInfoDiv.innerHTML = '';
    
        for (const patient of patientData.entry) {
            const patientName = patient.resource.name[0].given.join(' ') + ' ' + patient.resource.name[0].family;
            const patientGender = patient.resource.gender;
            const patientBirthDate = patient.resource.birthDate;
            const patientNacionalidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/nationality');
            const patientDNI = patient.resource.identifier[0].value;
            const patientLastName = patient.resource.name[0].family;
            const patientSexo = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/sex');
            const patientOcupation = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/occupation');
            const patientVoluntad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/advanced-directive');
            const patientDiscapacidad = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/disability');
            const patientResidentActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'country');
            const patientMunipioActual = getExtensionAddressValue(patient, 'http://localhost:8080/fhir/StructureDefinition/address', 'city');
            const patientPertEtnica = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/ethnicity');
            const patientZonaTerritorial = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/residence-area');
            const patientEntidadRespondiente = getExtensionValue(patient, 'http://localhost:8080/fhir/StructureDefinition/responding-entity');
    
            const patientDetailsHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nombre:</strong> ${patientName}</p>
                        <p><strong>Género:</strong> ${patientGender}</p>
                        <p><strong>Fecha de Nacimiento:</strong> ${patientBirthDate}</p>
                        <p><strong>País de Nacionalidad:</strong> ${patientNacionalidad}</p>
                        <p><strong>Documento de Identificación:</strong> ${patientDNI}</p>
                        <p><strong>Apellidos:</strong> ${patientLastName}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Sexo:</strong> ${patientSexo}</p>
                        <p><strong>Ocupación:</strong> ${patientOcupation ? patientOcupation : 'No especificado'}</p>
                        <p><strong>Voluntad Anticipada:</strong> ${patientVoluntad ? patientVoluntad : 'No especificado'}</p>
                        <p><strong>Categoría de Discapacidad:</strong> ${patientDiscapacidad ? patientDiscapacidad : 'No especificado'}</p>
                        <p><strong>País de Residencia:</strong> ${patientResidentActual ? patientResidentActual : 'No especificado'}</p>
                        <p><strong>Municipio de Residencia:</strong> ${patientMunipioActual ? patientMunipioActual : 'No especificado'}</p>
                        <p><strong>Pertenencia Étnica:</strong> ${patientPertEtnica ? patientPertEtnica : 'No especificado'}</p>
                        <p><strong>Zona Territorial:</strong> ${patientZonaTerritorial ? patientZonaTerritorial : 'No especificado'}</p>
                        <p><strong>Entidad Respondiente:</strong> ${patientEntidadRespondiente ? patientEntidadRespondiente : 'No especificado'}</p>
                    </div>
                    <button type="button" class="btn btn-primary" id="editHistoryButton">Editar historia</button>
                    </div>
                `;
                patientInfoDiv.innerHTML += patientDetailsHTML;
            }

            // Mostrar la sección de detalles del paciente
            document.getElementById('patientDetails').classList.remove('d-none');

            // Agregar el evento de escucha al botón de editar historia
            document.getElementById('editHistoryButton').addEventListener('click', function() {
                document.getElementById('editPatientFormContainer').classList.remove('d-none');
            });
    }
  
    function getExtensionValue(patient, url) {
        const extension = patient.resource.extension.find(ext => ext.url === url);
        return extension ? extension.valueString : undefined;
    }
    
    function getExtensionAddressValue(patient, url, field) {
        const extension = patient.resource.extension.find(ext => ext.url === url);
        return extension && extension.valueAddress ? extension.valueAddress[field] : undefined;
    }
    
   
    
    
});
