const loadBtn =
    document.querySelector("#loadBtn");

const parkingList =
    document.querySelector("#parkingList");

const summary =
    document.querySelector("#summary");

const prevBtn =
    document.querySelector("#prevBtn");

const nextBtn =
    document.querySelector("#nextBtn");

const pageInfo =
    document.querySelector("#pageInfo");


let currentPage = 1;

const rowsPerPage = 10;



loadBtn.addEventListener(
    "click",
    () => loadParkingData(1)
);


prevBtn.addEventListener(
    "click",
    () => {

        if (currentPage > 1) {

            loadParkingData(
                currentPage - 1
            );
        }
    }
);


nextBtn.addEventListener(
    "click",
    () => {

        loadParkingData(
            currentPage + 1
        );
    }
);



async function loadParkingData(pageNo) {

    parkingList.innerHTML =
        "<p>주차장 정보를 불러오는 중입니다...</p>";


    try {

        const response = await fetch(
            `/api/parking?pageNo=${pageNo}&numOfRows=${rowsPerPage}`
        );


        if (!response.ok) {

            throw new Error(
                `HTTP 오류: ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "API 전체 응답",
            data
        );


        // 공공데이터포털의 일반적인 JSON 구조
        const body =
            data.response?.body;


        if (!body) {

            console.log(data);

            throw new Error(
                "API 응답 구조를 확인할 수 없습니다."
            );
        }


        let items =
            body.items?.item || [];


        // 데이터가 1건인 경우 배열이 아닐 수도 있음
        if (!Array.isArray(items)) {

            items = [items];
        }


        const totalCount =
            Number(body.totalCount || 0);


        currentPage = pageNo;


        showSummary(
            totalCount
        );


        showParkingList(
            items
        );


        updatePaging(
            totalCount
        );


    } catch (error) {

        console.error(error);

        parkingList.innerHTML = `
            <p class="error">
                주차장 정보를 불러오지 못했습니다.<br>
                ${error.message}
            </p>
        `;
    }
}



function showParkingList(items) {

    parkingList.innerHTML = "";


    if (items.length === 0) {

        parkingList.innerHTML =
            "<p>조회된 주차장이 없습니다.</p>";

        return;
    }


    items.forEach(
        parking => {

            const card =
                document.createElement("div");

            card.className =
                "parking-card";


            const name =
                parking.pkNam || "이름 없음";


            const address =
                parking.doroAddr !== "-"
                    && parking.doroAddr
                    ? parking.doroAddr
                    : parking.jibunAddr || "주소정보 없음";


            const total =
                parking.pkCnt || "-";


            const available =
                parking.currava;


            const status =
                getParkingStatus(
                    available,
                    total
                );


            card.innerHTML = `

                <h2>
                    ${name}
                </h2>

                <p>
                    📍 ${address}
                </p>

                <div class="parking-info">

                    <div>
                        <span>전체 주차면</span>

                        <strong>
                            ${total}
                        </strong>
                    </div>

                    <div>
                        <span>실시간 주차면</span>

                        <strong>
                            ${isValidNumber(available)
                    ? available
                    : "정보없음"
                }
                        </strong>
                    </div>

                </div>


                <div class="status ${status.className}">
                    ${status.text}
                </div>

            `;


            parkingList.appendChild(
                card
            );
        }
    );
}



function getParkingStatus(
    available,
    total
) {

    if (
        !isValidNumber(available)
        ||
        !isValidNumber(total)
    ) {

        return {
            text: "실시간 정보 없음",
            className: "unknown"
        };
    }


    const availableNumber =
        Number(available);

    const totalNumber =
        Number(total);


    if (availableNumber === 0) {

        return {
            text: "만차",
            className: "full"
        };
    }


    const ratio =
        availableNumber
        /
        totalNumber;


    if (ratio >= 0.5) {

        return {
            text: "여유",
            className: "good"
        };
    }


    if (ratio >= 0.2) {

        return {
            text: "보통",
            className: "normal"
        };
    }


    return {
        text: "혼잡",
        className: "busy"
    };
}



function isValidNumber(value) {

    return (
        value !== undefined
        &&
        value !== null
        &&
        value !== "-"
        &&
        value !== ""
        &&
        !isNaN(Number(value))
    );
}



function showSummary(totalCount) {

    summary.innerHTML = `
        전체 공영주차장
        <strong>
            ${totalCount}
        </strong>
        곳
    `;
}



function updatePaging(totalCount) {

    const totalPages =
        Math.ceil(
            totalCount / rowsPerPage
        );


    pageInfo.textContent =
        `${currentPage} / ${totalPages} 페이지`;


    prevBtn.disabled =
        currentPage <= 1;


    nextBtn.disabled =
        currentPage >= totalPages;
}