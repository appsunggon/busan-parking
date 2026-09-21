export async function onRequestGet(context) {

    try {

        // Cloudflare 환경변수에서 인증키 가져오기
        let serviceKey = context.env.BUSAN_API_KEY;

        if (!serviceKey) {
            return jsonResponse(
                {
                    error: "BUSAN_API_KEY가 설정되어 있지 않습니다."
                },
                500
            );
        }

        serviceKey = serviceKey.trim();

        try {
            serviceKey = decodeURIComponent(serviceKey);
        } catch (error) {
            // 그대로 사용
        }


        // 브라우저에서 전달된 값
        const requestUrl = new URL(context.request.url);

        const pageNo =
            requestUrl.searchParams.get("pageNo") || "1";

        const numOfRows =
            requestUrl.searchParams.get("numOfRows") || "10";


        // 실제 부산시설공단 공영주차장 API
        const apiUrl = new URL(
            "https://apis.data.go.kr/B552587/ParkingInfoService_v2/getParkingList_v2"
        );


        apiUrl.searchParams.set(
            "serviceKey",
            serviceKey
        );

        apiUrl.searchParams.set(
            "pageNo",
            pageNo
        );

        apiUrl.searchParams.set(
            "numOfRows",
            numOfRows
        );

        apiUrl.searchParams.set(
            "resultType",
            "json"
        );


        // 공공데이터 API 호출
        const response =
            await fetch(apiUrl.toString());


        const text =
            await response.text();


        // 오류 발생 시 실제 응답 확인
        if (!response.ok) {

            return jsonResponse(
                {
                    error: "공공데이터 API 호출 실패",
                    status: response.status,
                    detail: text
                },
                response.status
            );
        }


        // JSON 변환
        let data;

        try {

            data =
                JSON.parse(text);

        } catch (error) {

            return jsonResponse(
                {
                    error: "API 응답이 JSON 형식이 아닙니다.",
                    response: text
                },
                500
            );
        }


        // 그대로 브라우저에 전달
        return jsonResponse(
            data,
            200
        );


    } catch (error) {

        return jsonResponse(
            {
                error: "서버 처리 중 오류가 발생했습니다.",
                detail: error.message
            },
            500
        );
    }
}



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