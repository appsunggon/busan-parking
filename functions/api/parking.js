export async function onRequestGet(context) {

    try {

        // 1. Cloudflare 환경변수에서 인증키 가져오기
        let serviceKey = context.env.BUSAN_API_KEY;


        // 인증키가 없는 경우
        if (!serviceKey) {

            return jsonResponse(
                {
                    error: "BUSAN_API_KEY가 설정되어 있지 않습니다."
                },
                500
            );
        }


        // 앞뒤 공백 제거
        serviceKey = serviceKey.trim();


        // 혹시 Encoding Key를 넣은 경우를 대비
        // 이미 디코딩된 키라면 그대로 사용됨
        try {
            serviceKey = decodeURIComponent(serviceKey);
        } catch (error) {
            // 디코딩 실패 시 원래 값 사용
        }


        // 2. 브라우저에서 전달받은 요청값 읽기
        const requestUrl = new URL(context.request.url);


        const pageNo =
            requestUrl.searchParams.get("pageNo") || "1";


        const numOfRows =
            requestUrl.searchParams.get("numOfRows") || "10";


        // 3. 부산 공영주차장 Open API 주소
        const apiUrl = new URL(
            "https://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo"
        );


        // 4. API 요청 파라미터 추가
        apiUrl.searchParams.set(
            "serviceKey",
            serviceKey
        );


        apiUrl.searchParams.set(
            "numOfRows",
            numOfRows
        );


        apiUrl.searchParams.set(
            "pageNo",
            pageNo
        );


        apiUrl.searchParams.set(
            "resultType",
            "json"
        );


        // 5. 부산 공영주차장 API 호출
        const response =
            await fetch(
                apiUrl.toString()
            );


        // 응답 내용을 먼저 읽는다
        const text =
            await response.text();


        // 6. HTTP 오류인 경우
        // 실제 공공데이터 API 오류 내용까지 전달
        if (!response.ok) {

            return jsonResponse(
                {
                    error:
                        "공공데이터 API 호출 실패",

                    status:
                        response.status,

                    detail:
                        text
                },
                response.status
            );
        }


        // 7. JSON 변환
        let data;


        try {

            data =
                JSON.parse(text);

        } catch (error) {

            return jsonResponse(
                {
                    error:
                        "API 응답이 JSON 형식이 아닙니다.",

                    response:
                        text
                },
                500
            );
        }


        // 8. 정상 데이터 반환
        return jsonResponse(
            data,
            200
        );


    } catch (error) {

        // 예상하지 못한 오류
        return jsonResponse(
            {
                error:
                    "서버 처리 중 오류가 발생했습니다.",

                detail:
                    error.message
            },
            500
        );
    }
}



/*
    JSON 응답 생성 함수
*/
function jsonResponse(
    data,
    status = 200
) {

    return new Response(
        JSON.stringify(
            data,
            null,
            2
        ),
        {
            status: status,

            headers: {
                "Content-Type":
                    "application/json; charset=utf-8"
            }
        }
    );
}