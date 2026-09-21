const loadBtn = document.querySelector("#loadBtn");
const result = document.querySelector("#result");

loadBtn.addEventListener("click", loadParkingData);


async function loadParkingData() {

    result.textContent = "데이터를 불러오는 중입니다...";

    try {

        const response = await fetch(
            "/api/parking?pageNo=1&numOfRows=10"
        );

        if (!response.ok) {
            throw new Error(
                `HTTP 오류: ${response.status}`
            );
        }

        const data = await response.json();

        console.log(data);

        result.textContent =
            JSON.stringify(data, null, 2);

    } catch (error) {

        console.error(error);

        result.textContent =
            "API 호출 중 오류가 발생했습니다.\n"
            + error.message;
    }
}