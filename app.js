const searchInput =
    document.querySelector("#searchInput");

const searchBtn =
    document.querySelector("#searchBtn");

const resetBtn =
    document.querySelector("#resetBtn");

const parkingList =
    document.querySelector("#parkingList");

const summary =
    document.querySelector("#summary");

const paging =
    document.querySelector("#paging");

const prevBtn =
    document.querySelector("#prevBtn");

const nextBtn =
    document.querySelector("#nextBtn");

const pageInfo =
    document.querySelector("#pageInfo");


let currentPage = 1;

const rowsPerPage = 10;


/*
 * 페이지가 열리면
 * 자동으로 첫 페이지 조회
 */
window.addEventListener(
    "DOMContentLoaded",
    () => {

        loadParkingData(1);
    }
);


/*
 * 검색 버튼
 */
searchBtn.addEventListener(
    "click",
    searchParking
);


/*
 * Enter 키 검색
 */
searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchParking();
        }
    }
);


/*
 * 전체보기
 */
resetBtn.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        loadParkingData(1);
    }
);


/*
 * 이전
 */
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


/*
 * 다음
 */
nextBtn.addEventListener(
    "click",
    () => {

        loadParkingData(
            currentPage + 1
        );
    }
);


/*
 * 검색 실행
 */
function searchParking() {

    const keyword =
        searchInput.value.trim();


    if (!keyword) {

        loadParkingData(1);

        return;
    }


    loadParkingData(
        1,
        keyword
    );
}


/*
 * Cloudflare API 호출
 */
async function loadParkingData(
    pageNo,
    keyword = ""
) {

    parkingList.innerHTML = `

        <p class="no-result">
            주차장 정보를 불러오는 중입니다...
        </p>

    `;


    try {

        const params =
            new URLSearchParams();


        params.set(
            "pageNo",
            pageNo
        );


        params.set(
            "numOfRows",
            rowsPerPage
        );


        if (keyword) {

            params.set(
                "keyword",
                keyword
            );
        }


        const response =
            await fetch(
                `/api/parking?${params.toString()}`
            );


        if (!response.ok) {

            throw new Error(
                `HTTP 오류: ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "주차장 데이터:",
            data
        );


        currentPage =
            pageNo;


        showSummary(
            data.totalCount,
            data.keyword
        );


        showParkingList(
            data.items
        );


        /*
         * 검색 중에는 페이지 이동 숨김
         */
        if (data.keyword) {

            paging.style.display =
                "none";

        } else {

            paging.style.display =
                "flex";


            updatePaging(
                data.totalCount
            );
        }


    } catch (error) {

        console.error(error);


        parkingList.innerHTML = `

            <p class="error">
                주차장 정보를 불러오지 못했습니다.
                <br>
                ${escapeHtml(error.message)}
            </p>

        `;
    }
}


/*
 * 주차장 목록 출력
 */
function showParkingList(items) {

    parkingList.innerHTML = "";


    if (
        !items
        ||
        items.length === 0
    ) {

        parkingList.innerHTML = `

            <p class="no-result">
                검색된 주차장이 없습니다.
            </p>

        `;

        return;
    }


    items.forEach(
        parking => {

            const card =
                document.createElement("article");


            card.className =
                "parking-card";


            const name =
                escapeHtml(
                    parking.parknm || "이름 없음"
                );


            const code =
                escapeHtml(
                    parking.parkgcd || "-"
                );


            /*
             * 실시간 정보가 없는 경우
             */
            if (parking.error) {

                card.innerHTML = `

                    <div class="card-header">

                        <div>

                            <h2>
                                ${name}
                            </h2>

                            <span class="parking-code">
                                ${code}
                            </span>

                        </div>


                        <span class="status unknown">
                            정보 없음
                        </span>

                    </div>


                    <div class="available">

                        <span>
                            실시간 주차정보
                        </span>

                        <strong>
                            -
                        </strong>

                    </div>

                `;


                parkingList.appendChild(
                    card
                );


                return;
            }


            const status =
                getParkingStatus(
                    parking.curravacnt,
                    parking.maxcnt
                );


            const updateTime =
                formatUpdateTime(
                    parking.lastupdatetime
                );


            card.innerHTML = `

                <div class="card-header">

                    <div>

                        <h2>
                            ${name}
                        </h2>

                        <span class="parking-code">
                            ${code}
                        </span>

                    </div>


                    <span
                        class="status ${status.className}"
                    >
                        ${status.text}
                    </span>

                </div>


                <div class="available">

                    <span>
                        주차 가능
                    </span>

                    <strong>
                        ${parking.curravacnt}
                    </strong>

                    <span>
                        대
                    </span>

                </div>


                <div class="parking-detail">

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

                </div>


                <div class="update-time">
                    ${updateTime} 기준
                </div>

            `;


            parkingList.appendChild(
                card
            );
        }
    );
}


/*
 * 주차상태 판단
 */
function getParkingStatus(
    available,
    total
) {

    if (
        total === undefined
        ||
        total === null
        ||
        Number(total) <= 0
    ) {

        return {
            text: "정보 없음",
            className: "unknown"
        };
    }


    const availableNumber =
        Number(available);


    const totalNumber =
        Number(total);


    if (availableNumber <= 0) {

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


/*
 * 검색결과 요약
 */
function showSummary(
    totalCount,
    keyword
) {

    if (keyword) {

        summary.innerHTML = `

            "<strong>
                ${escapeHtml(keyword)}
            </strong>"

            검색 결과

            <strong>
                ${totalCount}
            </strong>
            곳

        `;

    } else {

        summary.innerHTML = `

            전체 공영주차장

            <strong>
                ${totalCount}
            </strong>
            곳

        `;
    }
}


/*
 * 페이지 표시
 */
function updatePaging(totalCount) {

    const totalPages =
        Math.ceil(
            totalCount / rowsPerPage
        );


    pageInfo.textContent =
        `${currentPage} / ${totalPages}`;


    prevBtn.disabled =
        currentPage <= 1;


    nextBtn.disabled =
        currentPage >= totalPages;
}


/*
 * 날짜에서 시간만 표시
 *
 * 2026-09-21 16:20:01
 * →
 * 16:20
 */
function formatUpdateTime(
    dateTime
) {

    if (!dateTime) {

        return "갱신시간 없음";
    }


    const parts =
        String(dateTime)
            .split(" ");


    if (parts.length < 2) {

        return dateTime;
    }


    return parts[1]
        .substring(0, 5);
}


/*
 * HTML 특수문자 처리
 */
function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}