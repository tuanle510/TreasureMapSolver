using BE.Model;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
// using BE.Model; // Bỏ comment nếu model ở namespace khác

[ApiController]
[Route("api/[controller]")]
public class TreasureController : ControllerBase
{
    [HttpPost("calculate")]
    public ActionResult<double> Calculate([FromBody] TreasureMap request)
    {
        // ---- Validate input
        if (request == null) return BadRequest("Body is required.");
        int n = request.N, m = request.M, p = request.P;
        if (n <= 0 || m <= 0 || p <= 0) return BadRequest("N, M, P must be positive.");
        if (request.Map == null || request.Map.Length != n ||
            request.Map.Any(row => row == null || row.Length != m))
            return BadRequest("Map size must be N x M.");

        // buckets[k] = danh sách các tọa độ (1-based) của các đảo mang số k
        var buckets = new List<(int r, int c)>[p + 1];
        for (int k = 1; k <= p; k++) buckets[k] = new List<(int r, int c)>();

        for (int i = 0; i < n; i++)
        {
            for (int j = 0; j < m; j++)
            {
                int val = request.Map[i][j];
                if (val < 1 || val > p) return BadRequest("Map contains value out of range [1..P].");
                buckets[val].Add((i + 1, j + 1)); // dùng tọa độ 1-based như đề
            }
        }

        if (buckets[p].Count != 1)
            return BadRequest("There must be exactly one island with value P.");

        // ---- DP theo cấp rương: từ 1 đến p
        // base: từ (1,1) tới mọi ô có số 1
        double Dist((int r, int c) a, (int r, int c) b)
            => Math.Sqrt((a.r - b.r) * (a.r - b.r) + (a.c - b.c) * (a.c - b.c));

        var prevPos = buckets[1];
        var prevCost = new double[prevPos.Count];
        for (int i = 0; i < prevPos.Count; i++)
            prevCost[i] = Dist((1, 1), prevPos[i]);

        for (int key = 2; key <= p; key++)
        {
            var curPos = buckets[key];
            var curCost = Enumerable.Repeat(double.PositiveInfinity, curPos.Count).ToArray();

            for (int i = 0; i < curPos.Count; i++)
            {
                for (int j = 0; j < prevPos.Count; j++)
                {
                    double cand = prevCost[j] + Dist(prevPos[j], curPos[i]);
                    if (cand < curCost[i]) curCost[i] = cand;
                }
            }

            prevPos = curPos;
            prevCost = curCost;
        }

        // Rương p là duy nhất
        double answer = prevCost.Min();
        // Theo test mẫu, kết quả cần lấy floor
        return Ok(Math.Round(answer, 5));
    }
}