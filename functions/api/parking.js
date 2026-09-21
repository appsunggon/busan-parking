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


        // 공공데이터포털의 Encoding 인증키를 넣은 경우를 대비
        try {
            serviceKey = decodeURIComponent(serviceKey.trim());
        } catch {
            serviceKey = serviceKey.trim();
        }


        // 브라우저에서 전달받은 페이지 번호
        const requestUrl = new URL(context.request.url);

        const pageNo =
            requestUrl.searchParams.get("pageNo") || "1";

        const numOfRows =
            requestUrl.searchParams.get("numOfRows") || "10";


        // 부산 공영주차장 API
        const apiUrl = new URL(
            "http://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo"
        );


        // 요청 파라미터 설정
        apiUrl.searchParams.set("serviceKey", serviceKey);
        apiUrl.searchParams.set("pageNo", pageNo);
        apiUrl.searchParams.set("numOfRows", numOfRows);
        apiUrl.searchParams.set("resultType", "json");


        console.log("부산 공영주차장 API 호출");


        // 공공데이터 API 호출
        const response = await fetch(apiUrl.toString());


        if (!response.ok) {

            return jsonResponse(
                {
                    error: "공공데이터 API 호출 실패",
                    status: response.status
                },
                response.status
            );
        }


        const text = await response.text();


        // 혹시 JSON이 아닌 응답이 온 경우 확인하기 위함
        let data;

        try {

            data = JSON.parse(text);

        } catch {

            return jsonResponse(
                {
                    error: "API 응답이 JSON 형식이 아닙니다.",
                    response: text
                },
                500
            );
        }


        // 브라우저에 JSON 전달
        return jsonResponse(data);


    } catch (error) {

        return jsonResponse(
            {
                error: error.message
            },
            500
        );
    }
}


function jsonResponse(data, status = 200) {

    return new Response(
        JSON.stringify(data),
        {
            status: status,
            headers: {
                "Content-Type":
                    "application/json; charset=utf-8"
            }
        }
    );
}