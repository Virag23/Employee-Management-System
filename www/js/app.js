document.addEventListener("deviceready", function() {
    loadEmployees();

    $("#employeeForm").on("submit", function(e) {
        e.preventDefault();
        if (validateForm()) {
            saveEmployee();
        }
    });
});

const API_URL = "https://192.168.108.47/employee_api/api/employees.php";

function loadEmployees() {
    $.ajax({
        url: API_URL,
        method: "GET",
        dataType: "json",
        success: function(response) {
            console.log("API Response:", response);

            let employees = Array.isArray(response) ? response : response.employees;

            if (!employees || !Array.isArray(employees)) {
                console.error("Unexpected response format:", response);
                alert("Unexpected API response. Check the console.");
                return;
            }

            if ($.fn.DataTable.isDataTable("#employeeTable")) {
                $("#employeeTable").DataTable().destroy();
            }

            $("#employeeTable").DataTable({
                dom: "Bfrtip",
                buttons: [
                    { extend: "csv", text: "Export CSV" },
                    { extend: "pdfHtml5", text: "Export PDF" }
                ],
                data: employees,
                columns: [
                    { data: "id" },
                    { data: "name" },
                    { data: "email" },
                    { data: "phone" },
                    { data: "department_name" },
                    { data: "position_name" },
                    { data: "salary" },
                    {
                        data: null,
                        render: function (data, type, row) {
                            return `
                                <button class="btn btn-warning btn-sm" onclick="editEmployee(${row.id})"><i class="fa fa-edit"></i></button>
                                <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${row.id})"><i class="fa fa-trash"></i></button>
                            `;
                        }
                    }
                ]
            });
        },
        error: function(xhr, status, error) {
            console.error("Failed to load employees:", error, xhr.responseText);
            alert("Failed to load employees. Check the API connection.");
        }
    });
}

function editEmployee(id) {
    $.ajax({
        url: API_URL + "?id=" + id, 
        method: "GET",
        dataType: "json",
        success: function(emp) {
            console.log("Editing Employee:", emp);

            $("#employeeId").val(emp.id);
            $("#name").val(emp.name);
            $("#email").val(emp.email);
            $("#phone").val(emp.phone);
            $("#department_id").val(emp.department_id);
            $("#position_id").val(emp.position_id);
            $("#salary").val(emp.salary);

            $("#employeeModal").modal("show");
        },
        error: function(xhr, status, error) {
            console.error("Error fetching employee details:", error, xhr.responseText);
            alert("Failed to fetch employee details.");
        }
    });
}

function validateForm() {
    let email = $("#email").val();
    let salary = $("#salary").val();
    
    if (!email.includes("@")) {
        alert("Invalid email address!");
        return false;
    }
    if (salary < 0) {
        alert("Salary must be a positive number!");
        return false;
    }
    return true;
}

function saveEmployee() {
    let id = $("#employeeId").val();
    let data = {
        name: $("#name").val(),
        email: $("#email").val(),
        phone: $("#phone").val(),
        department_id: $("#department_id").val(),
        position_id: $("#position_id").val(),
        salary: $("#salary").val()
    };

    let method = id ? "PUT" : "POST";
    if (id) data.id = id;

    $.ajax({
        url: API_URL,
        method: method,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response) {
            alert(response.message || response.error);
            $("#employeeForm")[0].reset();
            $("#employeeModal").modal("hide");
            loadEmployees();
        },
        error: function(xhr, status, error) {
            console.error("Error saving employee:", error, xhr.responseText);
            alert("Failed to save employee. Please try again.");
        }
    });
}

function deleteEmployee(id) {
    if (confirm("Are you sure you want to delete this employee?")) {
        $.ajax({
            url: API_URL,
            method: "DELETE",
            contentType: "application/json",
            data: JSON.stringify({ id }),
            success: function(response) {
                alert(response.message || response.error);
                loadEmployees();
            },
            error: function(xhr, status, error) {
                console.error("Error deleting employee:", error, xhr.responseText);
                alert("Failed to delete employee. Please try again.");
            }
        });
    }
}