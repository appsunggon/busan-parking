export async function onRequestGet(context) {

    try {

        // Cloudflare에 저장해 놓은 인증키
        const serviceKey = context.env.BUSAN_API_KEY;


        if (!serviceKey) {

            return new Response(
                JSON.stringify({
                    error: "API 인증키가 설정되지 않았습니다."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    }
                }
            );
        }


        // 브라우저에서 전달된 값
        const requestUrl = new URL(context.request.url);

        const pageNo =
            requestUrl.searchParams.get("pageNo") || "1";

        const numOfRows =
            requestUrl.searchParams.get("numOfRows") || "10";


        // 부산 공영주차장 API 요청주소
        const apiUrl = new URL(
            "여기에_공공데이터포털의_요청주소"
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


        // 실제 공공데이터 API 호출
        const response =
            await fetch(apiUrl.toString());


        const data =
            await response.text();


        return new Response(
            data,
            {
                status: response.status,
                headers: {
                    "Content-Type":
                        "application/json; charset=utf-8"
                }
            }
        );


    } catch (error) {

        return new Response(
            JSON.stringify({
                error: error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type":
                        "application/json; charset=utf-8"
                }
            }
        );
    }
}