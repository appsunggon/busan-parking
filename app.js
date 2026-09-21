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
            "주차장 데이터",
            data
        );


        currentPage = pageNo;


        showSummary(
            data.totalCount
        );


        showParkingList(
            data.items
        );


        updatePaging(
            data.totalCount
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


    items.forEach(
        parking => {

            const card =
                document.createElement("div");

            card.className =
                "parking-card";


            if (parking.error) {

                card.innerHTML = `

                    <h2>
                        ${parking.parknm}
                    </h2>

                    <p>
                        주차장 코드 :
                        ${parking.parkgcd}
                    </p>

                    <div class="status unknown">
                        실시간 정보 없음
                    </div>
                `;

            } else {

                const status =
                    getParkingStatus(
                        parking.curravacnt,
                        parking.maxcnt
                    );


                card.innerHTML = `

                    <h2>
                        ${parking.parknm}
                    </h2>

                    <p>
                        주차장 코드 :
                        ${parking.parkgcd}
                    </p>


                    <div class="parking-info">

                        <div>
                            <span>
                                전체 주차면
                            </span>

                            <strong>
                                ${parking.maxcnt}
                            </strong>
                        </div>


                        <div>
                            <span>
                                현재 주차
                            </span>

                            <strong>
                                ${parking.parkingcnt}
                            </strong>
                        </div>


                        <div>
                            <span>
                                주차 가능
                            </span>

                            <strong>
                                ${parking.curravacnt}
                            </strong>
                        </div>

                    </div>


                    <div class="status ${status.className}">
                        ${status.text}
                    </div>


                    <p class="update-time">
                        갱신 :
                        ${parking.lastupdatetime}
                    </p>
                `;
            }


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

    if (!total) {

        return {
            text: "정보 없음",
            className: "unknown"
        };
    }


    if (available === 0) {

        return {
            text: "만차",
            className: "full"
        };
    }


    const ratio =
        available / total;


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



function showSummary(totalCount) {

    summary.innerHTML = `
        전체 공영주차장
        <strong>${totalCount}</strong>
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